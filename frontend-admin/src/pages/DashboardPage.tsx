import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-8">
      {/* Hero Section */}
      <div className="hero bg-gradient-to-r from-primary to-secondary rounded-xl shadow-lg">
        <div className="hero-content flex-col lg:flex-row text-primary-content">
          <img src="/vite.svg" className="max-w-xs rounded-lg shadow-2xl mr-8" alt="Zemon Logo" />
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome to Zemon Admin</h1>
            <p className="py-2 text-lg opacity-90">Manage users, resources, and problems with a beautiful, modern dashboard powered by DaisyUI.</p>
            <div className="mt-4">
              <button className="btn btn-accent btn-lg">Get Started</button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats shadow w-full bg-base-100 rounded-xl grid grid-cols-1 md:grid-cols-3">
        <div className="stat">
          <div className="stat-figure text-primary">
            <span className="material-symbols-outlined text-4xl">group</span>
          </div>
          <div className="stat-title">Users</div>
          <div className="stat-value">128</div>
          <div className="stat-desc">↗︎ 12 this week</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-secondary">
            <span className="material-symbols-outlined text-4xl">flame</span>
          </div>
          <div className="stat-title">Forge Resources</div>
          <div className="stat-value">42</div>
          <div className="stat-desc">+5 new</div>
        </div>
        <div className="stat">
          <div className="stat-figure text-accent">
            <span className="material-symbols-outlined text-4xl">book</span>
          </div>
          <div className="stat-title">Crucible Problems</div>
          <div className="stat-value">87</div>
          <div className="stat-desc">+8 solved</div>
        </div>
      </div>

      {/* Recent Activity Card (Placeholder) */}
      <div className="card bg-base-100 shadow-xl rounded-xl">
        <div className="card-body">
          <h2 className="card-title">Recent Activity</h2>
          <ul className="timeline timeline-vertical mt-4">
            <li>
              <div className="timeline-start">User John Doe created a new Forge Resource</div>
              <div className="timeline-middle badge badge-primary"></div>
              <div className="timeline-end text-xs text-base-content/60">2 hours ago</div>
            </li>
            <li>
              <div className="timeline-start">Admin updated Crucible Problem #42</div>
              <div className="timeline-middle badge badge-secondary"></div>
              <div className="timeline-end text-xs text-base-content/60">5 hours ago</div>
            </li>
            <li>
              <div className="timeline-start">New user Jane Smith registered</div>
              <div className="timeline-middle badge badge-accent"></div>
              <div className="timeline-end text-xs text-base-content/60">1 day ago</div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 