# Content Review: Seed Prompt Tone (T018)

**Purpose**: Verify all 36 seed prompts (6 pools × 6 prompts) satisfy FR-004 —
flirtatious/sensual tone appropriate for consenting adult partners, neither
purely neutral/innocuous nor graphically explicit.

## Method

Every prompt in `content/prompts/*/truth.json` and `content/prompts/*/dare.json`
was read and checked against three criteria:

1. **Not neutral/innocuous**: does it go beyond a generic icebreaker
   ("what's your favorite color?")?
2. **Not graphically explicit**: does it avoid explicit anatomical/sexual
   description, staying suggestive rather than graphic?
3. **Personal/intimate framing**: is it addressed directly between the two
   partners ("tú"/"conmigo"), inviting a personal disclosure or a shared
   physical action?

## Findings

| Pool | Prompts reviewed | Neutral outliers | Explicit outliers | Result |
|---|---|---|---|---|
| male-female / truth | 6 | 0 | 0 | ✅ Pass |
| male-female / dare | 6 | 0 | 0 | ✅ Pass |
| male-male / truth | 6 | 0 | 0 | ✅ Pass |
| male-male / dare | 6 | 0 | 0 | ✅ Pass |
| female-female / truth | 6 | 0 | 0 | ✅ Pass |
| female-female / dare | 6 | 0 | 0 | ✅ Pass |

All 36 prompts are phrased as direct, personal, flirtatious invitations
(fantasies, attraction, physical closeness — kisses, whispers, dancing,
massage, undressing one item) without graphic anatomical/sexual language,
and without reading as neutral party-game trivia. Tone is consistent across
all three pairings — the same six situational categories (fantasy,
attraction, memory, body preference, boldest imagined scenario/dedicated
night) recur in each Truth pool, and the same six action categories (whisper,
neck kiss, remove one item, dance, massage, verbal declaration) recur in each
Dare pool, just re-worded per pairing.

## Outcome

No entries required revision. **T019 (revise flagged entries) is a no-op** —
the initial seed content from `002-seed-prompt-content/spec.md`'s Sample Seed
Content section already satisfies FR-004 across all pools.
