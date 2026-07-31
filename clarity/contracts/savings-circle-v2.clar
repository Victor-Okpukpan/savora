;; title: savings-circle
;; version: 0.1.0
;; summary: Ajo/Esusu-style rotating savings circles, denominated in native STX.
;; description:
;;   Members join a fixed-size circle and contribute an equal amount every
;;   round. Once everyone has paid in for a round, the pot (minus a protocol
;;   fee) is sent to whoever's turn it is, in join order. A circle can run for
;;   a single pass (everyone paid once, then done) or loop indefinitely across
;;   many passes until the creator ends it. Leaving before a circle ends
;;   forfeits a percentage of net contributions (paid in minus already
;;   received) as a penalty, split between the remaining pot and the
;;   protocol treasury.

;; traits
;;

;; token definitions
;;

;; constants

(define-constant ERR_NOT_ADMIN (err u100))
(define-constant ERR_NOT_CREATOR (err u101))
(define-constant ERR_CIRCLE_NOT_FOUND (err u102))
(define-constant ERR_CIRCLE_NOT_OPEN (err u103))
(define-constant ERR_ALREADY_MEMBER (err u104))
(define-constant ERR_NOT_MEMBER (err u105))
(define-constant ERR_CIRCLE_NOT_ACTIVE (err u106))
(define-constant ERR_ALREADY_CONTRIBUTED (err u107))
(define-constant ERR_ALREADY_LEFT (err u108))
(define-constant ERR_CANNOT_END_MID_PASS (err u109))
(define-constant ERR_INVALID_PERCENT (err u110))
(define-constant ERR_INVALID_PARAMS (err u111))
(define-constant ERR_SLOT_NOT_FOUND (err u112))
(define-constant ERR_ROUND_NOT_OPEN_YET (err u113))

(define-constant STATUS_OPEN u0)
(define-constant STATUS_ACTIVE u1)
(define-constant STATUS_ENDED u2)

(define-constant MAX_MEMBERS u100)

;; ~144 Bitcoin blocks/day * 365 days * 2 years -- a generous sanity cap so a
;; typo can't accidentally freeze a circle's next round for centuries.
(define-constant MAX_CYCLE_LENGTH_BLOCKS u105120)

;; data vars

(define-data-var admin principal tx-sender)
(define-data-var treasury principal tx-sender)
(define-data-var round-fee-percent uint u3)
(define-data-var leave-penalty-pot-percent uint u15)
(define-data-var leave-penalty-treasury-percent uint u5)
(define-data-var next-circle-id uint u0)

;; data maps

(define-map circles
  uint
  {
    creator: principal,
    contribution-amount: uint,
    member-count: uint,
    joined-count: uint,
    multi-pass: bool,
    status: uint,
    current-pass: uint,
    current-index: uint,
    contributions-this-round: uint,
    global-round: uint,
    pass-complete: bool,
    bonus-pool: uint,
    ;; Minimum gap, in Bitcoin blocks (~10 min each), required between one
    ;; round finishing and the next accepting contributions. u0 means no
    ;; enforced cadence -- rounds can start back-to-back.
    cycle-length-blocks: uint,
    ;; The earliest burn-block-height at which the current round will accept
    ;; contributions. u0 for a circle's first round (open immediately once
    ;; active).
    next-round-at: uint,
  }
)

;; Slot assignment: who is member #index in circle-id (join order == payout order)
(define-map circle-members
  { circle-id: uint, index: uint }
  principal
)

(define-map member-info
  { circle-id: uint, member: principal }
  {
    index: uint,
    total-contributed: uint,
    total-received: uint,
    has-left: bool,
  }
)

;; Tracks whether `member` has paid into `global-round` of `circle-id`
(define-map round-contributions
  { circle-id: uint, global-round: uint, member: principal }
  bool
)

;; private functions

(define-private (net-contribution (info { index: uint, total-contributed: uint, total-received: uint, has-left: bool }))
  (if (> (get total-contributed info) (get total-received info))
    (- (get total-contributed info) (get total-received info))
    u0
  )
)

;; Called once the final member of a round has contributed. Pays out the
;; current recipient (minus protocol fee), then advances the circle to its
;; next round or, if a pass just finished, either wraps to a new pass
;; (multi-pass circles) or ends the circle (single-pass circles).
(define-private (process-payout (circle-id uint))
  (let (
    (circle (unwrap! (map-get? circles circle-id) ERR_CIRCLE_NOT_FOUND))
    (recipient (unwrap! (map-get? circle-members { circle-id: circle-id, index: (get current-index circle) }) ERR_SLOT_NOT_FOUND))
    (recipient-info (unwrap! (map-get? member-info { circle-id: circle-id, member: recipient }) ERR_NOT_MEMBER))
    (pot (+ (* (get contribution-amount circle) (get member-count circle)) (get bonus-pool circle)))
    (fee (/ (* pot (var-get round-fee-percent)) u100))
    (payout-amount (- pot fee))
    (next-index (+ (get current-index circle) u1))
    (pass-finished (is-eq next-index (get member-count circle)))
  )
    (try! (as-contract (stx-transfer? fee tx-sender (var-get treasury))))
    (try! (as-contract (stx-transfer? payout-amount tx-sender recipient)))

    (map-set member-info { circle-id: circle-id, member: recipient }
      (merge recipient-info { total-received: (+ (get total-received recipient-info) payout-amount) })
    )

    (map-set circles circle-id
      (merge circle {
        current-index: (if pass-finished u0 next-index),
        current-pass: (if pass-finished (+ (get current-pass circle) u1) (get current-pass circle)),
        status: (if (and pass-finished (not (get multi-pass circle))) STATUS_ENDED (get status circle)),
        contributions-this-round: u0,
        global-round: (+ (get global-round circle) u1),
        pass-complete: pass-finished,
        bonus-pool: u0,
        next-round-at: (+ burn-block-height (get cycle-length-blocks circle)),
      })
    )
    (ok true)
  )
)

;; public functions

(define-public (set-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) ERR_NOT_ADMIN)
    (var-set admin new-admin)
    (ok new-admin)
  )
)

(define-public (set-treasury (new-treasury principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) ERR_NOT_ADMIN)
    (var-set treasury new-treasury)
    (ok new-treasury)
  )
)

(define-public (set-round-fee-percent (percent uint))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) ERR_NOT_ADMIN)
    (asserts! (<= percent u100) ERR_INVALID_PERCENT)
    (var-set round-fee-percent percent)
    (ok percent)
  )
)

(define-public (set-leave-penalty-percents (pot-percent uint) (treasury-percent uint))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) ERR_NOT_ADMIN)
    (asserts! (<= (+ pot-percent treasury-percent) u100) ERR_INVALID_PERCENT)
    (var-set leave-penalty-pot-percent pot-percent)
    (var-set leave-penalty-treasury-percent treasury-percent)
    (ok true)
  )
)

;; Creates a new circle. The creator automatically joins as member #0.
;; `cycle-length-blocks` is the minimum gap (in Bitcoin blocks) enforced
;; between rounds; u0 means no enforced cadence.
(define-public (create-circle (contribution-amount uint) (member-count uint) (multi-pass bool) (cycle-length-blocks uint))
  (let (
    (circle-id (var-get next-circle-id))
  )
    (asserts! (> contribution-amount u0) ERR_INVALID_PARAMS)
    (asserts! (and (> member-count u1) (<= member-count MAX_MEMBERS)) ERR_INVALID_PARAMS)
    (asserts! (<= cycle-length-blocks MAX_CYCLE_LENGTH_BLOCKS) ERR_INVALID_PARAMS)

    (map-set circles circle-id
      {
        creator: tx-sender,
        contribution-amount: contribution-amount,
        member-count: member-count,
        joined-count: u1,
        multi-pass: multi-pass,
        status: STATUS_OPEN,
        current-pass: u1,
        current-index: u0,
        contributions-this-round: u0,
        global-round: u0,
        pass-complete: false,
        bonus-pool: u0,
        cycle-length-blocks: cycle-length-blocks,
        next-round-at: u0,
      }
    )
    (map-set circle-members { circle-id: circle-id, index: u0 } tx-sender)
    (map-set member-info { circle-id: circle-id, member: tx-sender }
      { index: u0, total-contributed: u0, total-received: u0, has-left: false }
    )
    (var-set next-circle-id (+ circle-id u1))
    (ok circle-id)
  )
)

(define-public (join-circle (circle-id uint))
  (let (
    (circle (unwrap! (map-get? circles circle-id) ERR_CIRCLE_NOT_FOUND))
    (existing (map-get? member-info { circle-id: circle-id, member: tx-sender }))
    (new-index (get joined-count circle))
    (new-joined-count (+ new-index u1))
  )
    (asserts! (is-eq (get status circle) STATUS_OPEN) ERR_CIRCLE_NOT_OPEN)
    (asserts! (is-none existing) ERR_ALREADY_MEMBER)

    (map-set circle-members { circle-id: circle-id, index: new-index } tx-sender)
    (map-set member-info { circle-id: circle-id, member: tx-sender }
      { index: new-index, total-contributed: u0, total-received: u0, has-left: false }
    )
    (map-set circles circle-id
      (merge circle {
        joined-count: new-joined-count,
        status: (if (is-eq new-joined-count (get member-count circle)) STATUS_ACTIVE (get status circle)),
      })
    )
    (ok true)
  )
)

(define-public (contribute (circle-id uint))
  (let (
    (circle (unwrap! (map-get? circles circle-id) ERR_CIRCLE_NOT_FOUND))
    (info (unwrap! (map-get? member-info { circle-id: circle-id, member: tx-sender }) ERR_NOT_MEMBER))
    (round (get global-round circle))
    (already-paid (default-to false (map-get? round-contributions { circle-id: circle-id, global-round: round, member: tx-sender })))
    (new-contributions (+ (get contributions-this-round circle) u1))
  )
    (asserts! (is-eq (get status circle) STATUS_ACTIVE) ERR_CIRCLE_NOT_ACTIVE)
    (asserts! (not (get has-left info)) ERR_ALREADY_LEFT)
    (asserts! (not already-paid) ERR_ALREADY_CONTRIBUTED)
    (asserts! (>= burn-block-height (get next-round-at circle)) ERR_ROUND_NOT_OPEN_YET)

    (try! (stx-transfer? (get contribution-amount circle) tx-sender (as-contract tx-sender)))

    (map-set round-contributions { circle-id: circle-id, global-round: round, member: tx-sender } true)
    (map-set member-info { circle-id: circle-id, member: tx-sender }
      (merge info { total-contributed: (+ (get total-contributed info) (get contribution-amount circle)) })
    )
    (map-set circles circle-id
      (merge circle { contributions-this-round: new-contributions, pass-complete: false })
    )

    (if (is-eq new-contributions (get member-count circle))
      (process-payout circle-id)
      (ok true)
    )
  )
)

;; Leaves a circle before it's finished. Forfeits a percentage of net
;; contributions (paid in minus already received via payout) as a penalty --
;; part stays in the circle's pot as a bonus for the next payout, part goes
;; to the protocol treasury. Whatever's left is refunded immediately.
(define-public (leave-circle (circle-id uint))
  (let (
    (caller tx-sender)
    (circle (unwrap! (map-get? circles circle-id) ERR_CIRCLE_NOT_FOUND))
    (info (unwrap! (map-get? member-info { circle-id: circle-id, member: caller }) ERR_NOT_MEMBER))
    (net (net-contribution info))
    (pot-penalty (/ (* net (var-get leave-penalty-pot-percent)) u100))
    (treasury-penalty (/ (* net (var-get leave-penalty-treasury-percent)) u100))
    (refund (- net (+ pot-penalty treasury-penalty)))
  )
    (asserts! (not (get has-left info)) ERR_ALREADY_LEFT)
    (asserts! (not (is-eq (get status circle) STATUS_ENDED)) ERR_CIRCLE_NOT_ACTIVE)

    (map-set member-info { circle-id: circle-id, member: caller } (merge info { has-left: true }))
    (map-set circles circle-id
      (merge circle { bonus-pool: (+ (get bonus-pool circle) pot-penalty) })
    )

    (and (> treasury-penalty u0)
      (try! (as-contract (stx-transfer? treasury-penalty tx-sender (var-get treasury))))
    )
    (and (> refund u0)
      (try! (as-contract (stx-transfer? refund tx-sender caller)))
    )
    (ok true)
  )
)

;; Ends a multi-pass circle. Only the creator can call this, and only right
;; after a full pass has finished -- never mid-round, and never before at
;; least one full pass has completed.
(define-public (end-circle (circle-id uint))
  (let (
    (circle (unwrap! (map-get? circles circle-id) ERR_CIRCLE_NOT_FOUND))
  )
    (asserts! (is-eq tx-sender (get creator circle)) ERR_NOT_CREATOR)
    (asserts! (is-eq (get status circle) STATUS_ACTIVE) ERR_CIRCLE_NOT_ACTIVE)
    (asserts! (get pass-complete circle) ERR_CANNOT_END_MID_PASS)
    (ok (map-set circles circle-id (merge circle { status: STATUS_ENDED })))
  )
)

;; read only functions

(define-read-only (get-circle (circle-id uint))
  (map-get? circles circle-id)
)

(define-read-only (get-member-info (circle-id uint) (member principal))
  (map-get? member-info { circle-id: circle-id, member: member })
)

(define-read-only (get-circle-member (circle-id uint) (index uint))
  (map-get? circle-members { circle-id: circle-id, index: index })
)

(define-read-only (has-contributed-this-round (circle-id uint) (member principal))
  (match (map-get? circles circle-id)
    circle (default-to false (map-get? round-contributions { circle-id: circle-id, global-round: (get global-round circle), member: member }))
    false
  )
)

;; Total number of circles ever created. Circle ids are 0..(get-circle-count)-1,
;; so a frontend can enumerate every circle by iterating that range.
(define-read-only (get-circle-count)
  (var-get next-circle-id)
)

(define-read-only (get-admin)
  (var-get admin)
)

(define-read-only (get-treasury)
  (var-get treasury)
)

(define-read-only (get-fee-config)
  {
    round-fee-percent: (var-get round-fee-percent),
    leave-penalty-pot-percent: (var-get leave-penalty-pot-percent),
    leave-penalty-treasury-percent: (var-get leave-penalty-treasury-percent),
  }
)
