# Color Contrast Audit Report

Generated on: 2025-08-03T12:27:16.390Z

## Summary

- **Total Combinations Tested**: 34
- **Passed**: 30 (88%)
- **Failed**: 4 (12%)
- **Overall Grade**: FAIL

## Light Theme Results

**Passed**: 13/17 combinations

### Passing Combinations

| Name | Foreground | Background | Ratio | Grade | Usage |
|------|------------|------------|-------|-------|-------|
| Primary Button Hover | #ffffff | #2563eb | 5.17:1 | AA | Primary button text on hover state |
| Primary Link | #2563eb | #ffffff | 5.17:1 | AA | Primary links on main background |
| Secondary Button | #111827 | #f3f4f6 | 16.12:1 | AAA | Secondary button text on light background |
| Secondary Button Hover | #111827 | #e5e7eb | 14.33:1 | AAA | Secondary button text on hover state |
| Primary Text | #111827 | #ffffff | 17.74:1 | AAA | Main body text on background |
| Secondary Text | #4b5563 | #ffffff | 7.56:1 | AAA | Secondary text on background |
| Muted Text | #6b7280 | #ffffff | 4.83:1 | AA | Muted text on background |
| Card Text | #111827 | #ffffff | 17.74:1 | AAA | Text on card background |
| Input Text | #111827 | #ffffff | 17.74:1 | AAA | Input text on input background |
| Input Placeholder | #6b7280 | #ffffff | 4.83:1 | AA | Placeholder text in inputs |
| Success Text | #15803d | #ffffff | 5.02:1 | AA | Success message text |
| Error Text | #b91c1c | #ffffff | 6.47:1 | AA | Error message text |
| Warning Text | #b45309 | #ffffff | 5.02:1 | AA | Warning message text |

### Failed Combinations

| Name | Foreground | Background | Ratio | Grade | Usage |
|------|------------|------------|-------|-------|-------|
| Primary Button | #ffffff | #3b82f6 | 3.68:1 | FAIL | Primary button text on primary background |
| Success Button | #ffffff | #22c55e | 2.28:1 | FAIL | Success button text |
| Error Button | #ffffff | #ef4444 | 3.76:1 | FAIL | Error button text |
| Warning Button | #ffffff | #f59e0b | 2.15:1 | FAIL | Warning button text |

## Dark Theme Results

**Passed**: 17/17 combinations

### Passing Combinations

| Name | Foreground | Background | Ratio | Grade | Usage |
|------|------------|------------|-------|-------|-------|
| Primary Button | #000000 | #3b82f6 | 5.71:1 | AA | Primary button text on primary background |
| Primary Button Hover | #000000 | #60a5fa | 8.26:1 | AAA | Primary button text on hover state |
| Primary Link | #60a5fa | #0f172a | 7.02:1 | AAA | Primary links on main background |
| Secondary Button | #f3f4f6 | #111827 | 16.12:1 | AAA | Secondary button text on light background |
| Secondary Button Hover | #f3f4f6 | #1f2937 | 13.34:1 | AAA | Secondary button text on hover state |
| Primary Text | #f3f4f6 | #0f172a | 16.22:1 | AAA | Main body text on background |
| Secondary Text | #9ca3af | #0f172a | 7.03:1 | AAA | Secondary text on background |
| Muted Text | #9ca3af | #0f172a | 7.03:1 | AAA | Muted text on background |
| Card Text | #f1f5f9 | #1e293b | 13.35:1 | AAA | Text on card background |
| Input Text | #f3f4f6 | #1e293b | 13.29:1 | AAA | Input text on input background |
| Input Placeholder | #9ca3af | #1e293b | 5.76:1 | AA | Placeholder text in inputs |
| Success Text | #bbf7d0 | #0f172a | 14.73:1 | AAA | Success message text |
| Success Button | #14532d | #4ade80 | 5.23:1 | AA | Success button text |
| Error Text | #fecaca | #0f172a | 12.34:1 | AAA | Error message text |
| Error Button | #000000 | #f87171 | 7.59:1 | AAA | Error button text |
| Warning Text | #fde68a | #0f172a | 14.33:1 | AAA | Warning message text |
| Warning Button | #78350f | #fbbf24 | 5.43:1 | AA | Warning button text |

## WCAG Requirements

- **AA Normal Text**: 4.5:1 minimum contrast ratio
- **AA Large Text**: 3:1 minimum contrast ratio
- **AAA Normal Text**: 7:1 minimum contrast ratio
- **AAA Large Text**: 4.5:1 minimum contrast ratio

## Recommendations

⚠️ **4 color combinations failed WCAG AA requirements.**

Please review the failed combinations above and adjust colors to meet accessibility standards.

## Next Steps

1. Review failed combinations and adjust colors
2. Test with real users who have visual impairments
3. Use automated accessibility testing tools
4. Consider AAA compliance for critical UI elements
