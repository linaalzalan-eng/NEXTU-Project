# User Flows

Stories: `USER_STORIES.md`. Rules: `PRD.md`. Screen layouts are added in Phase 2 (`DESIGN_SYSTEM.md`, P2-T01).

## 1. Navigation Map

```mermaid
flowchart LR
    Start([Open app]) --> Session{Session restored?}
    Session -- Loading --> Splash[Loading screen]
    Splash --> Session
    Session -- No --> Login[/login/]
    Session -- Yes --> Dash[/dashboard/]
    Login <--> Register[/register/]
    Login <--> Forgot[/forgot-password/]
    Forgot -. email link .-> Reset[/reset-password/]
    Reset -- success --> Dash
    Login -- success --> Dash
    Register -- success, confirmation off --> Dash
    Register -- confirmation on --> Check[Check your email screen]
    Dash <--> Tasks[/tasks/]
    Dash <--> Analytics[/analytics/]
    Tasks <--> Analytics
    Dash & Tasks & Analytics -- Log out --> Login
    Any[Unknown URL] --> NotFound[Not Found page]
```

Before Phase 5 there is no authentication: the app opens directly on `/dashboard` with a mock user (D-08).

## 2. Registration and Login

```mermaid
flowchart TD
    A[Visitor opens protected route] --> B[Redirect to /login, remember target]
    B --> C{Has account?}
    C -- No --> R[Register form]
    R --> RV{Valid input? VR-01, VR-02}
    RV -- No --> RE[Inline field errors] --> R
    RV -- Yes --> RS[Submit: authService.signUp]
    RS -- Email taken, confirmation off --> RX[Message: email already registered] --> R
    RS -- Network error --> RN[Error + Retry] --> R
    RS -- Confirmation on: new or existing email --> RC[Check your email screen]
    RS -- Session created --> T[Go to remembered target or /dashboard]
    C -- Yes --> L[Login form]
    L --> LV{Valid input?}
    LV -- No --> LE[Inline errors] --> L
    LV -- Yes --> LS[Submit: authService.signIn]
    LS -- Invalid credentials --> LX[Generic error message] --> L
    LS -- Email not confirmed --> LC[Message: confirm your email first] --> L
    LS -- Success --> T
```

### Password Reset (US-26, D-19)

```mermaid
flowchart TD
    L[Login form] --> F[Forgot password? → /forgot-password]
    F --> FV{Valid email? VR-01}
    FV -- No --> FE[Inline error] --> F
    FV -- Yes --> FS[Submit: authService.requestPasswordReset]
    FS -- Network error --> FN[Error + Retry] --> F
    FS -- Done --> FM[Same message for every email: If an account exists, we sent a link]
    FM -. user opens email link .-> P[/reset-password/]
    P --> PS{Session type?}
    PS -- None or expired --> PX[Link invalid or expired + link to /forgot-password]
    PS -- Normal session --> D
    PS -- Recovery: isRecovery --> PF[New password + confirmation]
    PF --> PV{Valid? VR-02, VR-05}
    PV -- No --> PE[Inline errors] --> PF
    PV -- Yes --> PU[Submit: authService.updatePassword]
    PU -- UNAUTHENTICATED --> PX
    PU -- Other error --> PR[Error message] --> PF
    PU -- Success --> D[/dashboard/]
```

## 3. Task Creation

```mermaid
flowchart TD
    A[Tasks page or Dashboard quick-add] --> B[Type title, date defaults to viewed date]
    B --> C{Valid? VR-03, VR-04}
    C -- No --> E[Inline error, focus stays in field] --> B
    C -- Yes --> D[Optimistic insert in list]
    D --> S[tasksService.createTask]
    S -- OK --> OK[Replace temp item with saved task, clear field, keep focus]
    S -- Error --> RB[Remove temp item, show error toast with Retry]
```

## 4. Task Editing and Rescheduling

```mermaid
flowchart TD
    A[Click Edit on a task] --> B[Edit dialog: title + date prefilled]
    B --> C{Action}
    C -- Cancel / Esc --> X[Close, no change, focus returns to Edit button]
    C -- Save --> V{Valid?}
    V -- No --> VE[Inline errors] --> B
    V -- Yes --> U[tasksService.updateTask]
    U -- OK --> M{Date changed?}
    M -- No --> L[Update item in place]
    M -- Yes --> MV[Remove from current date view, notice: moved to DATE]
    U -- Error --> UE[Keep dialog open, show error]
```

## 5. Task Completion

```mermaid
flowchart TD
    A[Toggle checkbox] --> B[Optimistic status flip + stats recalculate]
    B --> C[tasksService.setTaskCompletion]
    C -- OK --> D[Keep new state; completed_at set or cleared - BR-12]
    C -- Error --> E[Revert state + error toast]
```

## 6. Task Deletion

```mermaid
flowchart TD
    A[Click Delete] --> B[Confirm dialog: permanent, affects past statistics - BR-07]
    B -- Cancel --> X[Close, focus returns]
    B -- Confirm --> C[tasksService.deleteTask]
    C -- OK --> D[Remove from list, toast]
    C -- NOT_FOUND --> D
    C -- Error --> E[Keep task, error toast]
```

## 7. Dashboard Interactions

```mermaid
flowchart TD
    A[Open /dashboard] --> B[Load today's tasks + overdue]
    B -- Loading --> SK[Skeleton cards]
    B -- Error --> ER[Error card + Retry]
    B -- Loaded --> C{Tasks today?}
    C -- No --> EM[Empty state: plan your day + quick-add; rate shows —]
    C -- Yes --> D[Counters, rate, progress bar, message BR-13, task list]
    D --> T[Toggle task] --> D
    D --> Q[Quick-add] --> D
    D --> O{Overdue > 0?}
    O -- Yes --> OL[Overdue banner linking to the Tasks overdue section]
```

## 8. Analytics Navigation

```mermaid
flowchart TD
    A[Open /analytics] --> L[Lazy-load charts - NFR-03]
    L --> B[Load task history]
    B -- Error --> ER[Error + Retry]
    B -- Loaded --> C{Any tasks ever?}
    C -- No --> EM[Empty state: start adding tasks to see progress, link to /tasks]
    C -- Yes --> D[Week vs last week cards - BR-04]
    D --> E[Daily chart: current + previous week]
    E --> F[8-week trend chart]
    F --> G[Personal best cards - BR-05]
    G --> H[How is this calculated? explanation]
```

## 9. Empty, Loading, and Error States

Every data view handles all three states:

- **Loading:** a skeleton placeholder. The layout does not jump. Loading text is announced politely to screen readers.
- **Empty states:**
  - Tasks for a date: "No tasks for this day" + add form focus.
  - Filter has no results: "No completed tasks yet" / "Everything is done" (depends on the filter).
  - Dashboard: no tasks today → invite to plan (BR-13).
  - Analytics: no history → explanation + link to Tasks.
  - Comparison: previous period has no data → "Not enough data" (BR-04, BR-06).
- **Errors:**
  - Network or server: a friendly message + Retry. Optimistic changes are rolled back.
  - Session expired: redirect to login with a notice.
  - Unknown route: Not Found page with a link to the Dashboard.
  - Unexpected crash: the error boundary shows a recovery screen with a Reload button.
