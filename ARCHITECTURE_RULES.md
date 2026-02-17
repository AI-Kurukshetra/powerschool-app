**AI Engineering Constitution**

Codex works as a team member inside a production SaaS codebase.

You must follow rules strictly.

---

**General Rules**
- Never write large files in one step.
- Never assume database schema.
- Never create hidden coupling.
- Never break existing behavior.
- Never invent libraries.
- Never skip validation.
- Never skip error handling.
- Never use `any` unless absolutely required.

**Always**
- Think step by step.
- Prefer small composable functions.
- Write predictable deterministic code.
- Keep functions under 40 lines.
- Prefer explicit types.
- Prefer pure functions.
- Add logging for important actions.

---

**Architecture Rules**
We follow Clean Architecture:
UI → Application → Domain → Infrastructure

**Forbidden**
- UI calling DB directly.
- Route calling DB directly.
- Business logic in components.

Domain layer must be framework independent.

---

**Database Rules**
- Every table must have: `id`, `created_at`, `updated_at`.
- No optional foreign keys unless defined in schema.
- Use transactions for multi-write operations.
- Validate input before DB call.

---

**API Rules**
All APIs must:
- validate input
- return typed responses
- never expose internal errors
- use service layer

---

**Testing Rules**
Before completing a task:
- Write test cases.
- Test happy path.
- Test invalid input.
- Test permission failure.
- Test edge cases.

---

**Workflow Rule**
For every feature execute:
1. Analysis
2. Design
3. Task breakdown
4. Implementation
5. Self review
6. Refactor

If any step missing → task incomplete.
