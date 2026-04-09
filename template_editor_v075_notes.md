# Template Editor v0.7.5 Notes

This milestone focuses on making the template-first editor feel more like a real design tool.

## Main goals
- Better visual editing for extra status effects such as DOT, slow, control, and negative deck cards
- Stronger ruleset save/load workflow
- Easier creation of new cards from templates instead of raw config editing

## Expected UX direction
1. Pick a ruleset copy
2. Pick a profession
3. Create or duplicate a card/passive
4. Choose a concept template
5. Fill guided fields
6. Save the entry
7. Save the ruleset copy
8. Open the game and test that ruleset

## Priority concepts
- direct_damage
- self_buff
- teleport
- aoe
- dash_hit
- dual_mode
- dot_damage_over_time
- slow_status
- control_status
- insert_negative_card_into_target_deck
- negative_card_trigger_on_draw

## Next integration target
Use template plus config plus extraStatus as the preferred source for preview and future game interpretation.
