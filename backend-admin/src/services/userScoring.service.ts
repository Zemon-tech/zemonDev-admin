import User from '../models/user.model';
import mongoose from 'mongoose';

type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

const BASE_POINTS: Record<Difficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 30,
  expert: 40,
};

const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  expert: 4,
};

export function calculatePoints(difficulty: Difficulty, score: number): number {
  const base = BASE_POINTS[difficulty] ?? 0;
  const multiplier = DIFFICULTY_MULTIPLIER[difficulty] ?? 1;
  const scoreMultiplier = Math.max(0.1, Math.min(1, (score || 0) / 100));
  const points = Math.floor(base * multiplier * scoreMultiplier);
  return Math.max(1, points);
}

export function extractSkillsFromProblem(category: string, tags: string[]): {
  skills: Array<{ skill: string; category: string }>;
  tech: Array<{ technology: string; category: string }>;
  topics: Array<{ topic: string; category: string }>;
} {
  const normalized = (value?: string) => (value || '').toLowerCase();
  const tagSet = new Set(tags.map((t) => normalized(t)));
  const cat = normalized(category);

  const skills: Array<{ skill: string; category: string }> = [];
  const tech: Array<{ technology: string; category: string }> = [];
  const topics: Array<{ topic: string; category: string }> = [];

  const pushIf = (cond: boolean, arr: any[], payload: any) => {
    if (cond) arr.push(payload);
  };

  // Languages
  pushIf(tagSet.has('javascript') || tagSet.has('js') || tagSet.has('typescript') || tagSet.has('ts'), skills, { skill: 'JavaScript', category: 'programming-language' });
  pushIf(tagSet.has('python'), skills, { skill: 'Python', category: 'programming-language' });
  pushIf(tagSet.has('java'), skills, { skill: 'Java', category: 'programming-language' });

  // Frameworks
  pushIf(tagSet.has('react'), tech, { technology: 'React', category: 'framework' });
  pushIf(tagSet.has('nodejs') || tagSet.has('node'), tech, { technology: 'Node.js', category: 'runtime' });
  pushIf(tagSet.has('express'), tech, { technology: 'Express.js', category: 'framework' });

  // Databases
  pushIf(tagSet.has('mongodb') || tagSet.has('mongo'), tech, { technology: 'MongoDB', category: 'database' });
  pushIf(tagSet.has('postgresql') || tagSet.has('postgres'), tech, { technology: 'PostgreSQL', category: 'database' });
  pushIf(tagSet.has('mysql'), tech, { technology: 'MySQL', category: 'database' });
  pushIf(tagSet.has('redis'), tech, { technology: 'Redis', category: 'database' });

  // Cloud & DevOps
  pushIf(tagSet.has('aws'), skills, { skill: 'AWS', category: 'cloud' });
  pushIf(tagSet.has('docker'), skills, { skill: 'Docker', category: 'devops' });
  pushIf(tagSet.has('kubernetes') || tagSet.has('k8s'), skills, { skill: 'Kubernetes', category: 'devops' });
  pushIf(tagSet.has('terraform'), skills, { skill: 'Terraform', category: 'devops' });

  // Algorithms & DS
  if (cat === 'algorithms' || tagSet.has('algorithms')) {
    topics.push({ topic: 'Algorithms', category: 'cs-fundamentals' });
  }
  if (cat === 'system-design' || tagSet.has('system-design')) {
    topics.push({ topic: 'System Design', category: 'architecture' });
  }
  if (tagSet.has('dynamic-programming')) {
    topics.push({ topic: 'Dynamic Programming', category: 'algorithms' });
  }

  return { skills, tech, topics };
}

export async function updateUserScoring(params: {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  analysisId: mongoose.Types.ObjectId;
  score: number;
  difficulty: Difficulty;
  category: string;
  tags: string[];
  solvedAt?: Date;
  reattempts?: number;
}) {
  const { userId, problemId, analysisId, score, difficulty, category, tags, solvedAt, reattempts } = params;
  const points = calculatePoints(difficulty, score);

  const solvedDate = solvedAt || new Date();
  const dateKey = solvedDate.toISOString().slice(0, 10);

  const user = await User.findById(userId);
  if (!user) return;

  // Initialize nested structures if absent
  user.stats = user.stats || ({} as any);
  (user.stats as any).totalPoints = ((user.stats as any).totalPoints || 0) + points;
  (user.stats as any).highestScore = Math.max((user.stats as any).highestScore || 0, score || 0);

  // Average score update using running average
  const prevSolved = user.stats.problemsSolved || 0;
  const newSolved = prevSolved + 1;
  const prevAvg = (user.stats as any).averageScore || 0;
  const newAvg = (prevAvg * prevSolved + (score || 0)) / Math.max(1, newSolved);
  (user.stats as any).averageScore = Math.round(newAvg);
  user.stats.problemsSolved = newSolved;

  // Difficulty aggregates
  const diffKey = difficulty;
  (user.stats as any).problemsByDifficulty = (user.stats as any).problemsByDifficulty || {};
  const diffBucket = (user.stats as any).problemsByDifficulty[diffKey] || { solved: 0, averageScore: 0, totalPoints: 0 };
  const newSolvedDiff = diffBucket.solved + 1;
  const newAvgDiff = (diffBucket.averageScore * diffBucket.solved + (score || 0)) / Math.max(1, newSolvedDiff);
  (user.stats as any).problemsByDifficulty[diffKey] = {
    solved: newSolvedDiff,
    averageScore: Math.round(newAvgDiff),
    totalPoints: (diffBucket.totalPoints || 0) + points,
  };

  // Category aggregates
  (user.stats as any).problemsByCategory = (user.stats as any).problemsByCategory || new Map();
  const prevCat = (user.stats as any).problemsByCategory.get?.(category) || { solved: 0, averageScore: 0, totalPoints: 0 };
  const catSolved = prevCat.solved + 1;
  const catAvg = (prevCat.averageScore * prevCat.solved + (score || 0)) / Math.max(1, catSolved);
  (user.stats as any).problemsByCategory.set?.(category, { solved: catSolved, averageScore: Math.round(catAvg), totalPoints: (prevCat.totalPoints || 0) + points });

  // Problem history
  user.problemHistory = user.problemHistory || [];
  user.problemHistory.push({
    problemId,
    analysisId,
    score,
    points,
    difficulty,
    category,
    tags,
    solvedAt: solvedDate,
    reattempts: reattempts || 0,
  } as any);

  // Daily stats upsert
  user.dailyStats = user.dailyStats || [];
  const day = user.dailyStats.find((d) => d.date === dateKey);
  if (day) {
    day.points += points;
    day.problemsSolved += 1;
  } else {
    user.dailyStats.push({ date: dateKey, points, problemsSolved: 1 } as any);
  }

  // Skill extraction & tracking
  const extracted = extractSkillsFromProblem(category, tags);
  user.skillTracking = user.skillTracking || ({} as any);
  user.skillTracking.skills = user.skillTracking.skills || [];
  user.skillTracking.techStack = user.skillTracking.techStack || [];
  user.skillTracking.learningProgress = user.skillTracking.learningProgress || [];

  const upsertArray = <T extends { [k: string]: any }>(arr: T[], match: (it: T) => boolean, create: () => T, update: (it: T) => void) => {
    let item = arr.find(match);
    if (!item) {
      item = create();
      arr.push(item);
    }
    update(item);
  };

  extracted.skills.forEach((s) => {
    upsertArray(
      user.skillTracking!.skills as any,
      (it: any) => it.skill === s.skill,
      () => ({ skill: s.skill, category: s.category, level: 'beginner', progress: 0, problemsSolved: 0, totalPoints: 0, averageScore: 0, lastUpdated: new Date() } as any),
      (it: any) => {
        it.problemsSolved += 1;
        it.totalPoints += points;
        it.averageScore = Math.round(((it.averageScore || 0) * Math.max(0, it.problemsSolved - 1) + (score || 0)) / Math.max(1, it.problemsSolved));
        it.lastSolvedAt = solvedDate;
        it.lastUpdated = new Date();
      }
    );
  });

  extracted.tech.forEach((t) => {
    upsertArray(
      user.skillTracking!.techStack as any,
      (it: any) => it.technology === t.technology,
      () => ({ technology: t.technology, category: t.category, proficiency: 0, problemsSolved: 0, totalPoints: 0, averageScore: 0, lastUpdated: new Date() } as any),
      (it: any) => {
        it.problemsSolved += 1;
        it.totalPoints += points;
        it.averageScore = Math.round(((it.averageScore || 0) * Math.max(0, it.problemsSolved - 1) + (score || 0)) / Math.max(1, it.problemsSolved));
        it.lastUsedAt = solvedDate;
        it.lastUpdated = new Date();
      }
    );
  });

  extracted.topics.forEach((t) => {
    upsertArray(
      user.skillTracking!.learningProgress as any,
      (it: any) => it.topic === t.topic,
      () => ({ topic: t.topic, category: t.category, mastery: 0, problemsSolved: 0, totalPoints: 0, averageScore: 0, lastUpdated: new Date() } as any),
      (it: any) => {
        it.problemsSolved += 1;
        it.totalPoints += points;
        it.averageScore = Math.round(((it.averageScore || 0) * Math.max(0, it.problemsSolved - 1) + (score || 0)) / Math.max(1, it.problemsSolved));
        it.lastStudiedAt = solvedDate;
        it.lastUpdated = new Date();
      }
    );
  });

  // Activity log
  user.activityLog = user.activityLog || [];
  user.activityLog.push({ type: 'problem_solved', points, category, occurredAt: solvedDate, meta: { difficulty, score, problemId, analysisId } } as any);

  await user.save();

  return { points };
}

export async function getUserSkillSummary(userId: mongoose.Types.ObjectId) {
  const user = await User.findById(userId).lean();
  if (!user) return null;
  return {
    totalPoints: (user.stats as any)?.totalPoints || 0,
    averageScore: (user.stats as any)?.averageScore || 0,
    highestScore: (user.stats as any)?.highestScore || 0,
    skills: user.skillTracking?.skills || [],
    techStack: user.skillTracking?.techStack || [],
    learningProgress: user.skillTracking?.learningProgress || [],
    problemsByDifficulty: (user.stats as any)?.problemsByDifficulty || {},
    problemsByCategory: (user.stats as any)?.problemsByCategory || {},
  };
}

export async function rebuildDailyStatsFromHistory(userId: mongoose.Types.ObjectId) {
  const user = await User.findById(userId);
  if (!user) return null;
  const map = new Map<string, { points: number; problemsSolved: number }>();
  for (const h of user.problemHistory || []) {
    const day = (h.solvedAt as any as Date)?.toISOString().slice(0, 10);
    if (!day) continue;
    const entry = map.get(day) || { points: 0, problemsSolved: 0 };
    entry.points += (h.points as any) || 0;
    entry.problemsSolved += 1;
    map.set(day, entry);
  }
  user.dailyStats = Array.from(map.entries()).map(([date, v]) => ({ date, points: v.points, problemsSolved: v.problemsSolved } as any));
  await user.save();
  return user.dailyStats;
}

export async function recomputeLearningPatterns(userId: mongoose.Types.ObjectId) {
  const user = await User.findById(userId);
  if (!user) return null;
  const timeBuckets: any = { morning: [], afternoon: [], evening: [], night: [] };
  const diffBuckets: any = { easy: [], medium: [], hard: [], expert: [] };
  const catBuckets: Record<string, number[]> = {};

  (user.problemHistory || []).forEach((h) => {
    const date = new Date(h.solvedAt as any);
    const hour = date.getUTCHours();
    const score = (h.score as any) || 0;
    const category = (h.category as any) || 'general';
    if (hour >= 5 && hour < 12) timeBuckets.morning.push(score);
    else if (hour >= 12 && hour < 17) timeBuckets.afternoon.push(score);
    else if (hour >= 17 && hour < 22) timeBuckets.evening.push(score);
    else timeBuckets.night.push(score);
    diffBuckets[h.difficulty as any]?.push(score);
    if (!catBuckets[category]) catBuckets[category] = [];
    catBuckets[category].push(score);
  });

  const avg = (arr: number[]) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);
  user.learningPatterns = {
    timeOfDayPerformance: {
      morning: avg(timeBuckets.morning),
      afternoon: avg(timeBuckets.afternoon),
      evening: avg(timeBuckets.evening),
      night: avg(timeBuckets.night),
    },
    difficultyPerformance: {
      easy: avg(diffBuckets.easy),
      medium: avg(diffBuckets.medium),
      hard: avg(diffBuckets.hard),
      expert: avg(diffBuckets.expert),
    },
    categoryPerformance: Object.fromEntries(Object.entries(catBuckets).map(([k, v]) => [k, avg(v)])),
  } as any;
  await user.save();
  return user.learningPatterns;
}

export async function recomputeRoleMatch(userId: mongoose.Types.ObjectId, targetRole?: string) {
  const user = await User.findById(userId);
  if (!user) return null;
  const role = targetRole || user.activeGoal?.role || 'Generalist';
  const skills = user.skillTracking?.skills || [];
  // Very lightweight heuristic: average of top 5 skills' progress/avg score
  const top = [...skills].sort((a: any, b: any) => (b.averageScore || 0) - (a.averageScore || 0)).slice(0, 5);
  const match = top.length ? Math.round(top.reduce((s: number, x: any) => s + (x.averageScore || 0), 0) / top.length) : 0;
  user.roleMatch = {
    targetRole: role,
    matchPercent: match,
    gaps: [],
    lastComputedAt: new Date(),
  } as any;
  await user.save();
  return user.roleMatch;
}

export async function getDashboardSummary(userId: mongoose.Types.ObjectId) {
  const user = await User.findById(userId).lean();
  if (!user) return null;
  return {
    totalPoints: (user.stats as any)?.totalPoints || 0,
    averageScore: (user.stats as any)?.averageScore || 0,
    highestScore: (user.stats as any)?.highestScore || 0,
    skills: (user.skillTracking?.skills || []).slice(0, 5),
    dailyStats: (user.dailyStats || []).slice(-30),
    roleMatch: user.roleMatch || {},
    activeGoal: user.activeGoal || null,
  };
}

export async function getUserInsights(userId: mongoose.Types.ObjectId) {
  const user = await User.findById(userId).lean();
  if (!user) return null;
  const totals = {
    points: (user.stats as any)?.totalPoints || 0,
    averageScore: (user.stats as any)?.averageScore || 0,
    highestScore: (user.stats as any)?.highestScore || 0,
    problemsSolved: user.stats?.problemsSolved || 0,
  };
  return {
    totals,
    problemsByDifficulty: (user.stats as any)?.problemsByDifficulty || {},
    problemsByCategory: (user.stats as any)?.problemsByCategory || {},
    dailyStats: user.dailyStats || [],
    learningPatterns: user.learningPatterns || {},
    roleMatch: user.roleMatch || {},
    comparisons: user.comparisons || {},
    activeGoal: user.activeGoal || null,
  };
}

export async function getNextUpRecommendation(userId: mongoose.Types.ObjectId) {
  const user = await User.findById(userId).lean();
  if (!user) return null;
  const todayKey = new Date().toISOString().slice(0, 10);
  const today = (user.dailyStats || []).find((d) => d.date === todayKey);
  if (!today) {
    return {
      type: 'streak',
      title: 'Start your streak today',
      description: 'Solve one quick problem to kick off your momentum.',
      tags: ['Algorithms', 'beginner', '~10 mins'],
      action: { kind: 'solve_problem', difficulty: 'easy', category: 'algorithms' },
    };
  }
  if (user.activeGoal?.focusSkills?.length) {
    const focus = user.activeGoal.focusSkills[0];
    return {
      type: 'goal_gap',
      title: `Boost ${focus} towards your goal`,
      description: `Target a challenge in ${focus} to make progress.`,
      tags: [focus, 'medium', '~20 mins'],
      action: { kind: 'solve_problem', difficulty: 'medium', category: focus },
    };
  }
  return {
    type: 'explore',
    title: 'Explore a new category',
    description: 'Broaden your strengths with a fresh topic.',
    tags: ['System Design', 'beginner', '~15 mins'],
    action: { kind: 'solve_problem', difficulty: 'easy', category: 'system-design' },
  };
}

