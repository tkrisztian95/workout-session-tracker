## 1. Update PlanDayEditor Component

- [x] 1.1 Add local `showSchedule` state to `PlanDayEditor`, initialized to `day.weekdays.length > 0`
- [x] 1.2 Replace the always-visible weekday picker with a conditional block that renders only when `showSchedule` is true
- [x] 1.3 Add a "Schedule specific days" toggle (checkbox or small button) that sets `showSchedule` and clears `day.weekdays` when toggled off

## 2. Verify Behavior

- [x] 2.1 Confirm new days start with the picker hidden and no weekdays selected
- [x] 2.2 Confirm existing days with weekdays open with the picker expanded and days highlighted
- [x] 2.3 Confirm toggling off the picker clears the weekdays array on the day object
- [x] 2.4 Confirm toggling on the picker allows weekday selection and saves correctly
