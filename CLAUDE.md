<!-- darkforge:begin -->
## Workflow (darkforge)

- One task, one branch, one implementer.
- The reviewer is always a different agent from the implementer.
- Every darkforge agent dispatch sets `model` explicitly. Banned models: none.
- Run the quality gate before merging; it must print `ALL CHECKS PASSED` as a whole line.
- Merge only through `darkforge task merge`.
- Update the memory bank (`memory-bank/`) after every task.
- Global constraints live in `docs/plans/constraints.md`.
- Talk to the owner in vi.
<!-- darkforge:end -->
