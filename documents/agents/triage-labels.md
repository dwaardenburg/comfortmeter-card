# Triage labels

The skills speak in terms of five triage roles. This file maps them to the GitHub labels.

| Role              | Label             | Meaning                                            |
| ----------------- | ----------------- | -------------------------------------------------- |
| `needs-triage`    | `needs-triage`    | Daan needs to look at this issue                   |
| `needs-info`      | `needs-info`      | Waiting on the reporter for more information       |
| `ready-for-agent` | `ready-for-agent` | Fully specified, ready for an unattended agent run |
| `ready-for-human` | `ready-for-human` | Needs a person to implement                        |
| `wontfix`         | `wontfix`         | Will not be done; the closing comment says why     |

With one maintainer and few issues, most of this stays idle. `ready-for-agent` (applied by
`/to-spec` and `/to-tickets`) and `wontfix` carry their weight; the others exist so
`/triage` has somewhere to put a half-specified issue or an outside report.
