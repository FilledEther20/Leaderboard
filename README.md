# Architecture & Design Decisions

# Leaderboard System - Architecture & Design Decisions

> A scalable, real-time leaderboard system with tie-aware ranking

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Choices](#technology-choices)
3. [Backend Architecture](#backend-architecture)
4. [Frontend Architecture](#frontend-architecture)
5. [Data Flow](#data-flow)
6. [Key Algorithms](#key-algorithms)
7. [Performance Results](#performance-results)
8. [Trade-offs & Rationale](#trade-offs--rationale)
9. [Future Improvements](#future-improvements)

---

## System Overview

### What This System Does

- Manages **10,000+ users** with capacity to scale to millions
- Implements **tie-aware ranking** (same rating = same rank)
- Provides **real-time rank lookups** with sub-millisecond latency
- Offers **instant search** functionality across users
- Supports **non-blocking score updates**

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│              React Native (iOS, Android, Web)                   │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP/REST
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                │
│                    Go + Gin Framework                           │
│           Router → Handler → Service → Repository               │
└───────────────────────────┬─────────────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              ▼                           ▼
┌─────────────────────────┐   ┌───────────────────────────────────┐
│      PostgreSQL         │   │            Redis                  │
│   • Persistent storage  │   │   • Real-time rankings            │
│   • Full-text search    │   │   • O(log N) operations           │
│   • Source of truth     │   │   • Tie-aware rank calculation    │
└─────────────────────────┘   └───────────────────────────────────┘
```

---

## Technology Choices

### Backend Stack

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **Go (Golang)** | API Server | High concurrency, low latency, excellent for I/O-bound operations, compiled binary |
| **Gin Framework** | HTTP Router | Lightweight, fast, middleware support, widely adopted |
| **PostgreSQL** | Primary Database | ACID compliance, ILIKE for search, relational integrity |
| **Redis** | Rankings Cache | O(log N) sorted set operations, in-memory speed, atomic operations |
| **GORM** | ORM | Type-safe queries, auto-migration, connection pooling |

### Frontend Stack

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **React Native** | Cross-platform UI | Single codebase for iOS, Android, Web |
| **Expo** | Development Platform | Zero native config, OTA updates, easy web deployment |
| **Axios** | HTTP Client | Promise-based, interceptors, timeout handling |
| **FlatList** | List Rendering | Virtualization, infinite scroll support, memory efficient |

### Why Dual Database Architecture?

| Requirement | PostgreSQL | Redis | Winner |
|-------------|------------|-------|--------|
| Persistent storage | ✅ ACID | ❌ Memory-first | PostgreSQL |
| Sub-ms rank lookup | ❌ ~50ms | ✅ ~0.1ms | Redis |
| Full-text search | ✅ ILIKE | ❌ Limited | PostgreSQL |
| Tie-aware ranking | ❌ Complex | ✅ ZCOUNT | Redis |

**Conclusion**: Use PostgreSQL for durability and search, Redis for real-time rankings.

---

## Backend Architecture

### Directory Structure

```
backend/
├── cmd/server/main.go      # Entry point, dependency injection
├── internal/
│   ├── config/             # Environment-based configuration
│   ├── db/                 # PostgreSQL initialization
│   ├── redis/              # Redis client initialization
│   ├── models/             # Domain entities (User)
│   ├── repository/         # Data access layer (interfaces)
│   │   ├── repo.go         # Aggregated repository
│   │   ├── leader_repo.go  # Redis operations
│   │   └── user_repo.go    # PostgreSQL operations
│   ├── service/            # Business logic layer
│   ├── handler/            # HTTP request/response handling
│   ├── router/             # Route definitions, CORS middleware
│   └── seed/               # Database seeding (10k users)
└── Dockerfile              # Multi-stage build for production
```

### Design Patterns Used

#### 1. Clean Architecture (Layered)
```
HTTP Request → Router → Handler → Service → Repository → Database
```

| Layer | Responsibility |
|-------|----------------|
| Router | Route definitions, middleware (CORS) |
| Handler | HTTP I/O, input validation, response formatting |
| Service | Business logic, orchestration |
| Repository | Data access abstraction |

#### 2. Repository Pattern with Interfaces
```go
type LeaderboardRepository interface {
    GetTop(ctx context.Context, start, stop int64) ([]redis.Z, error)
    GetRank(ctx context.Context, score float64) (int64, error)
    UpdateScore(ctx context.Context, username string, score float64) error
    GetScores(ctx context.Context, usernames []string) (map[string]float64, error)
}
```

**Benefits**:
- Testability: Mock interfaces for unit tests
- Flexibility: Swap implementations without changing service layer
- Clear contracts: Interface defines available operations

#### 3. Dependency Injection
```go
func main() {
    cfg := config.NewConfig()
    dbConn := db.Init(cfg.PostgresDSN)
    rdb := redis.InitRedis(cfg.RedisAddr)
    repo := repository.NewRepo(dbConn, rdb, cfg.LeaderboardKey)
    svc := service.New(repo)
    h := handler.New(svc)
    r := router.Setup(h)
    r.Run(":" + cfg.Port)
}
```

Dependencies flow downward; each layer receives its dependencies via constructors.

#### 4. Environment-Based Configuration
```go
func NewConfig() *Config {
    return &Config{
        RedisAddr:   getEnv("REDIS_ADDR", "localhost:6379"),
        PostgresDSN: getEnv("POSTGRES_DSN", "..."),
        Port:        getEnv("PORT", "8080"),
    }
}
```

**Benefits**: Same binary works in dev/staging/production.

---

## Frontend Architecture

### Directory Structure

```
frontend/
├── App.js                  # Root component, tab navigation
├── index.js                # Entry point (Expo registration)
├── app.json                # Expo configuration
├── src/
│   ├── api/client.js       # Axios instance with base URL
│   ├── components/
│   │   ├── TabButton.js    # Reusable tab UI component
│   │   └── UserRow.js      # Memoized list item component
│   ├── screens/
│   │   ├── LeaderboardScreen.js  # Infinite scroll list
│   │   └── SearchScreen.js       # Debounced search
│   └── styles/theme.js     # Shared styles
└── vercel.json             # Vercel deployment config
```

### Key Implementation Decisions

#### 1. Infinite Scrolling with FlatList
```jsx
<FlatList
    data={data}
    onEndReached={handleLoadMore}      // Trigger at scroll end
    onEndReachedThreshold={0.5}        // 50% from bottom
    renderItem={({ item }) => <UserRow item={item} />}
/>
```

**Why FlatList over ScrollView?**
- Virtualization: Only renders visible items (~15 vs 10,000)
- Memory efficient: Unmounts off-screen components
- Built-in infinite scroll support

#### 2. Debounced Search (500ms)
```jsx
useEffect(() => {
    const timer = setTimeout(() => {
        if (query.length > 2) handleSearch(query);
    }, 500);
    return () => clearTimeout(timer);
}, [query]);
```

Prevents unnecessary re-renders when parent state changes.

#### 4. State-Based Tab Navigation
```jsx
const [activeTab, setActiveTab] = useState('leaderboard');

{activeTab === 'leaderboard' ? <LeaderboardScreen /> : <SearchScreen />}
```

**Why not React Navigation?**
- Only 2 screens, no deep linking needed
- Avoids 50KB+ library bundle
- Simpler mental model

---

## Data Flow

### Leaderboard Request Flow

```
1. Client: GET /leaderboard?page=2&limit=20

2. Service: Calculate offset
   start = (2-1) * 20 = 20
   stop = 20 + 20 - 1 = 39

3. Redis: ZREVRANGE lb:global 20 39 WITHSCORES
   → Returns users ranked 21-40 with scores

4. Redis: ZCOUNT lb:global (score +inf (for each user)
   → Returns rank (count of users with higher score + 1)

5. Response: [{username, rating, global_rank}, ...]
```

### Search Request Flow

```
1. Client: GET /search?q=rahul

2. PostgreSQL: SELECT * FROM users 
               WHERE username ILIKE '%rahul%' 
               ORDER BY rating DESC LIMIT 20

3. Redis (Pipelined): ZSCORE lb:global user1, user2, ...
   → Returns current scores in single round-trip

4. Redis: ZCOUNT for each user's rank

5. Response: [{username, rating, global_rank}, ...]
```

### Score Update Flow (Non-Blocking)

```
1. POST /simulate-update

2. PostgreSQL: Get random user

3. Redis: ZADD lb:global newScore username (INSTANT)

4. Response: {status: "updated"} ← Returns immediately

5. Background Goroutine: UPDATE users SET rating=X
   → Async, doesn't block response
```

---

## Key Algorithms

### Tie-Aware Ranking

**Problem**: Users with same rating must share the same rank.

```
Rating 5000 → Rank 1
Rating 4800 → Rank 2 (user_a)
Rating 4800 → Rank 2 (user_b)  ← TIED
Rating 4500 → Rank 4           ← Rank 3 skipped
```

**Solution**: Use Redis ZCOUNT instead of ZREVRANK

```go
func (r *leaderboardRepo) GetRank(ctx context.Context, score float64) (int64, error) {
    // Count users with score GREATER than this score
    return r.rdb.ZCount(ctx, r.leaderboardKey,
        fmt.Sprintf("(%f", score),  // "(" = exclusive (greater than)
        "+inf",                      // To infinity
    ).Result()
}
// Rank = count + 1
```

**Why this works**: Two users with 4800 rating both have the same number of users above them → same rank.

### Redis Sorted Set Operations

| Operation | Command | Complexity | Use Case |
|-----------|---------|------------|----------|
| Get top N | ZREVRANGE | O(log N + M) | Leaderboard page |
| Get rank | ZCOUNT | O(log N) | Tie-aware position |
| Update score | ZADD | O(log N) | Score change |
| Get score | ZSCORE | O(1) | Individual lookup |

---

## Performance Results

### k6 Load Test Results

```
┌─────────────────────────────────────────────────────────────┐
│                    LOAD TEST RESULTS                        │
├─────────────────────────────────────────────────────────────┤
│  Virtual Users:        100 concurrent                       │
│  Total Requests:       26,862                               │
│  Error Rate:           0.00%                                │
│  Throughput:           127 requests/second                  │
├─────────────────────────────────────────────────────────────┤
│  Response Times:                                            │
│  • Average:            3.74ms                               │
│  • p95:                8.85ms                               │
│  • Max:                30.04ms                              │
├─────────────────────────────────────────────────────────────┤
│  By Endpoint:                                               │
│  • Leaderboard avg:    1.08ms  (p95: 2ms)                  │
│  • Search avg:         6.59ms  (p95: 11ms)                 │
├─────────────────────────────────────────────────────────────┤
│  All Thresholds:       ✅ PASSED                            │
└─────────────────────────────────────────────────────────────┘
```

### Why Leaderboard is Faster Than Search

| Endpoint | Data Source | Operation | Latency |
|----------|-------------|-----------|---------|
| `/leaderboard` | Redis only | ZREVRANGE | ~1ms |
| `/search` | PostgreSQL + Redis | ILIKE + ZCOUNT | ~6ms |

---

## Trade-offs & Rationale

### 1. Eventual Consistency (Redis ↔ PostgreSQL)

**Decision**: Update Redis immediately, PostgreSQL asynchronously.

**Trade-off**: Brief inconsistency between stores.

**Rationale**:
- Read path needs speed → Redis is authoritative for rankings
- Write path can tolerate delay → async PostgreSQL
- PostgreSQL is recovery source if Redis fails

### 2. N+1 Queries for Rank Calculation

**Decision**: Make N Redis calls for N users' ranks.

**Trade-off**: Multiple round-trips instead of single query.

**Rationale**:
- Redis calls are ~0.1ms each
- 20 users × 0.1ms = 2ms total (acceptable)
- ZREVRANK doesn't handle ties correctly
- ZCOUNT gives correct tie-aware ranking

### 3. PostgreSQL ILIKE for Search

**Decision**: Use `ILIKE '%query%'` pattern matching.

**Trade-off**: Full table scan on 10k rows.

**Rationale**:
- Simple implementation
- Acceptable for 10k users (~6ms)
- Can add pg_trgm index later for millions

### 4. Simple Tab Navigation

**Decision**: useState instead of React Navigation library.

**Trade-off**: No deep linking, no navigation stack.

**Rationale**:
- Only 2 screens needed
- Reduces bundle size by ~50KB
- Simpler debugging

---
