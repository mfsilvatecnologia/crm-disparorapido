---
description: Create or update the feature specification from a natural language feature description.
---

Given the feature description provided as an argument, do this:

1. Run the script `.specify/scripts/bash/create-new-feature.sh --json "$ARGUMENTS"` from repo root and parse its JSON output for BRANCH_NAME and SPEC_FILE. All file paths must be absolute.
2. Load `.specify/templates/spec-template.md` to understand required sections.
3. Write the specification to SPEC_FILE using the template structure, replacing placeholders with concrete details derived from the feature description (arguments) while preserving section order and headings. Consider the project's feature-based architecture:
   - Specify whether the feature is new (requires complete feature structure) or extends existing
   - Identify which feature domain the specification belongs to (admin, authentication, campaigns, etc.)
   - Consider shared vs feature-specific components and services
   - Follow established patterns for component organization and imports
4. Report completion with branch name, spec file path, and readiness for the next phase.

Note: The script creates and checks out the new branch and initializes the spec file before writing.
