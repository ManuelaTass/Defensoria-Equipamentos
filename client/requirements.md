## Packages
date-fns | Date formatting and manipulation for event dates
recharts | Dashboard charts for event and equipment statistics
@hookform/resolvers | Form validation with Zod

## Notes
- Theme is adapted for Defensoria Pública de Goiás (Green, White, Gold accents).
- Relies on API schema defined in `shared/routes.ts` and `shared/schema.ts`.
- Uses native `<input type="datetime-local">` for date/time selection to ensure best mobile and desktop compatibility without complex date picker hydration issues.
