---
"@tanstack/cli": patch
---

Prevent add-on multiselect options from rendering with pagination markers by showing the full list, which avoids a Clack navigation glitch that could duplicate the second-to-last entry while moving between the bottom options.
