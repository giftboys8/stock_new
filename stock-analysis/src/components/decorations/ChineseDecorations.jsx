// 山水背景装饰组件
export const MountainBackground = () => {
  return (
    <>
      {/* 水墨渐变背景层 */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        {/* 顶部淡墨渐变 */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-ink-gray/5 via-transparent to-transparent"/>

        {/* 远山 - 最淡，最远 */}
        <div className="absolute bottom-0 left-0 w-full h-96 opacity-10">
          <svg viewBox="0 0 1440 320" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="mountain-grad-1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#4a4a4a', stopOpacity: 0.3 }} />
                <stop offset="100%" style={{ stopColor: '#2d5a3d', stopOpacity: 0.5 }} />
              </linearGradient>
            </defs>
            <path d="M0 320 L0 180 Q120 120 240 150 T480 130 T720 160 T960 140 T1200 170 T1440 150 L1440 320 Z"
                  fill="url(#mountain-grad-1)"/>
          </svg>
        </div>

        {/* 中山 - 中等距离 */}
        <div className="absolute bottom-0 left-0 w-full h-72 opacity-15">
          <svg viewBox="0 0 1440 240" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="mountain-grad-2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#5a5a5a', stopOpacity: 0.4 }} />
                <stop offset="100%" style={{ stopColor: '#3d6a4d', stopOpacity: 0.6 }} />
              </linearGradient>
            </defs>
            <path d="M0 240 L0 140 Q180 80 360 110 T720 90 T1080 120 T1440 100 L1440 240 Z"
                  fill="url(#mountain-grad-2)"/>
          </svg>
        </div>

        {/* 近山 - 最深，最近 */}
        <div className="absolute bottom-0 left-0 w-full h-48 opacity-20">
          <svg viewBox="0 0 1440 160" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="mountain-grad-3" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#6a6a6a', stopOpacity: 0.5 }} />
                <stop offset="100%" style={{ stopColor: '#4d7a5d', stopOpacity: 0.7 }} />
              </linearGradient>
            </defs>
            <path d="M0 160 L0 90 Q240 40 480 70 T960 50 T1440 80 L1440 160 Z"
                  fill="url(#mountain-grad-3)"/>
          </svg>
        </div>

        {/* 湖面倒影 */}
        <div className="absolute bottom-0 left-0 w-full h-24 opacity-8">
          <svg viewBox="0 0 1440 80" className="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="water-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#4a6fa5', stopOpacity: 0.2 }} />
                <stop offset="100%" style={{ stopColor: '#2d5a3d', stopOpacity: 0.4 }} />
              </linearGradient>
            </defs>
            {/* 水波纹 */}
            <path d="M0 40 Q60 35 120 40 T240 40 T360 40 T480 40 T600 40 T720 40 T840 40 T960 40 T1080 40 T1200 40 T1320 40 T1440 40 L1440 80 L0 80 Z"
                  fill="url(#water-grad)"/>
            <path d="M0 50 Q60 45 120 50 T240 50 T360 50 T480 50 T600 50 T720 50 T840 50 T960 50 T1080 50 T1200 50 T1320 50 T1440 50 L1440 80 L0 80 Z"
                  fill="url(#water-grad)" opacity="0.5"/>
            <path d="M0 60 Q60 55 120 60 T240 60 T360 60 T480 60 T600 60 T720 60 T840 60 T960 60 T1080 60 T1200 60 T1320 60 T1440 60 L1440 80 L0 80 Z"
                  fill="url(#water-grad)" opacity="0.3"/>
          </svg>
        </div>
      </div>
    </>
  );
};

// 印章装饰组件
export const Seal = () => {
  return (
    <div className="fixed bottom-6 right-6 w-20 h-20 border-2 border-bamboo rounded flex items-center justify-center font-title text-bamboo opacity-60 pointer-events-none -z-10">
      <div className="writing-mode-vertical text-sm tracking-widest">
        股票分析
      </div>
    </div>
  );
};

// 飞鸟装饰组件
export const Birds = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-5">
      <style>{`
        @keyframes flyRight {
          0% { transform: translateX(0) translateY(0); }
          25% { transform: translateX(30vw) translateY(-10px); }
          50% { transform: translateX(60vw) translateY(5px); }
          75% { transform: translateX(90vw) translateY(-5px); }
          100% { transform: translateX(120vw) translateY(0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .bird-flight {
          animation: flyRight 60s linear infinite;
        }

        .bird-float {
          animation: float 2s ease-in-out infinite;
        }
      `}</style>

      {/* 日间模式 - 大雁群（墨色，人字形队列，6只，随机速度） */}
      {/* 第一只大雁 - 领头（中间） */}
      <div className="absolute top-[30%] left-[5%] opacity-50 dark:opacity-0 bird-flight" style={{animationDelay: '0s', animationDuration: '58s'}}>
        <svg width="60" height="30" viewBox="0 0 60 30" className="bird-float">
          <path d="M0 15 Q15 6 30 15 Q45 6 60 15" stroke="#1a1a1a" fill="none" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </div>

      {/* 左侧第二只 */}
      <div className="absolute top-[33%] left-[4%] opacity-45 dark:opacity-0 bird-flight" style={{animationDelay: '0.4s', animationDuration: '62s'}}>
        <svg width="55" height="28" viewBox="0 0 55 28" className="bird-float" style={{animationDelay: '0.3s'}}>
          <path d="M0 14 Q13.75 5.5 27.5 14 Q41.25 5.5 55 14" stroke="#2a2a2a" fill="none" strokeWidth="2.8" strokeLinecap="round"/>
        </svg>
      </div>

      {/* 右侧第二只 */}
      <div className="absolute top-[33%] left-[6%] opacity-45 dark:opacity-0 bird-flight" style={{animationDelay: '0.5s', animationDuration: '59s'}}>
        <svg width="55" height="28" viewBox="0 0 55 28" className="bird-float" style={{animationDelay: '0.5s'}}>
          <path d="M0 14 Q13.75 5.5 27.5 14 Q41.25 5.5 55 14" stroke="#2a2a2a" fill="none" strokeWidth="2.8" strokeLinecap="round"/>
        </svg>
      </div>

      {/* 左侧第三只 */}
      <div className="absolute top-[36%] left-[3%] opacity-40 dark:opacity-0 bird-flight" style={{animationDelay: '0.8s', animationDuration: '64s'}}>
        <svg width="52" height="26" viewBox="0 0 52 26" className="bird-float" style={{animationDelay: '0.6s'}}>
          <path d="M0 13 Q13 5 26 13 Q39 5 52 13" stroke="#2a2a2a" fill="none" strokeWidth="2.6" strokeLinecap="round"/>
        </svg>
      </div>

      {/* 右侧第三只 */}
      <div className="absolute top-[36%] left-[7%] opacity-40 dark:opacity-0 bird-flight" style={{animationDelay: '0.9s', animationDuration: '63s'}}>
        <svg width="52" height="26" viewBox="0 0 52 26" className="bird-float" style={{animationDelay: '0.7s'}}>
          <path d="M0 13 Q13 5 26 13 Q39 5 52 13" stroke="#2a2a2a" fill="none" strokeWidth="2.6" strokeLinecap="round"/>
        </svg>
      </div>

      {/* 左侧第四只 */}
      <div className="absolute top-[39%] left-[2%] opacity-35 dark:opacity-0 bird-flight" style={{animationDelay: '1.3s', animationDuration: '65s'}}>
        <svg width="50" height="25" viewBox="0 0 50 25" className="bird-float" style={{animationDelay: '0.9s'}}>
          <path d="M0 12.5 Q12.5 5 25 12.5 Q37.5 5 50 12.5" stroke="#3a3a3a" fill="none" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>

      {/* 夜间模式 - 大雁群（月光绿，人字形队列，6只，随机速度） */}
      {/* 第一只大雁 - 领头（中间） */}
      <div className="absolute top-[30%] left-[5%] opacity-0 dark:opacity-50 bird-flight" style={{animationDelay: '0s', animationDuration: '58s'}}>
        <svg width="60" height="30" viewBox="0 0 60 30" className="bird-float">
          <path d="M0 15 Q15 6 30 15 Q45 6 60 15" stroke="#7fb069" fill="none" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </div>

      {/* 左侧第二只 */}
      <div className="absolute top-[33%] left-[4%] opacity-0 dark:opacity-45 bird-flight" style={{animationDelay: '0.4s', animationDuration: '62s'}}>
        <svg width="55" height="28" viewBox="0 0 55 28" className="bird-float" style={{animationDelay: '0.3s'}}>
          <path d="M0 14 Q13.75 5.5 27.5 14 Q41.25 5.5 55 14" stroke="#8fb882" fill="none" strokeWidth="2.8" strokeLinecap="round"/>
        </svg>
      </div>

      {/* 右侧第二只 */}
      <div className="absolute top-[33%] left-[6%] opacity-0 dark:opacity-45 bird-flight" style={{animationDelay: '0.5s', animationDuration: '59s'}}>
        <svg width="55" height="28" viewBox="0 0 55 28" className="bird-float" style={{animationDelay: '0.5s'}}>
          <path d="M0 14 Q13.75 5.5 27.5 14 Q41.25 5.5 55 14" stroke="#8fb882" fill="none" strokeWidth="2.8" strokeLinecap="round"/>
        </svg>
      </div>

      {/* 左侧第三只 */}
      <div className="absolute top-[36%] left-[3%] opacity-0 dark:opacity-40 bird-flight" style={{animationDelay: '0.8s', animationDuration: '64s'}}>
        <svg width="52" height="26" viewBox="0 0 52 26" className="bird-float" style={{animationDelay: '0.6s'}}>
          <path d="M0 13 Q13 5 26 13 Q39 5 52 13" stroke="#8fb882" fill="none" strokeWidth="2.6" strokeLinecap="round"/>
        </svg>
      </div>

      {/* 右侧第三只 */}
      <div className="absolute top-[36%] left-[7%] opacity-0 dark:opacity-40 bird-flight" style={{animationDelay: '0.9s', animationDuration: '63s'}}>
        <svg width="52" height="26" viewBox="0 0 52 26" className="bird-float" style={{animationDelay: '0.7s'}}>
          <path d="M0 13 Q13 5 26 13 Q39 5 52 13" stroke="#8fb882" fill="none" strokeWidth="2.6" strokeLinecap="round"/>
        </svg>
      </div>

      {/* 左侧第四只 */}
      <div className="absolute top-[39%] left-[2%] opacity-0 dark:opacity-35 bird-flight" style={{animationDelay: '1.3s', animationDuration: '65s'}}>
        <svg width="50" height="25" viewBox="0 0 50 25" className="bird-float" style={{animationDelay: '0.9s'}}>
          <path d="M0 12.5 Q12.5 5 25 12.5 Q37.5 5 50 12.5" stroke="#9fc991" fill="none" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
};

// 白云装饰组件（日间模式）
export const Clouds = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden opacity-0 dark:opacity-0 transition-opacity duration-300">
      {/* 左上方的云 */}
      <div className="absolute top-[8%] left-[5%] opacity-8">
        <svg width="180" height="80" viewBox="0 0 180 80">
          <ellipse cx="90" cy="50" rx="80" ry="25" fill="#e8e4dc" opacity="0.4"/>
          <ellipse cx="50" cy="55" rx="50" ry="20" fill="#e8e4dc" opacity="0.35"/>
          <ellipse cx="130" cy="55" rx="45" ry="18" fill="#e8e4dc" opacity="0.35"/>
        </svg>
      </div>

      {/* 右上方的云 */}
      <div className="absolute top-[12%] right-[10%] opacity-8">
        <svg width="200" height="90" viewBox="0 0 200 90">
          <ellipse cx="100" cy="55" rx="90" ry="28" fill="#e8e4dc" opacity="0.35"/>
          <ellipse cx="55" cy="60" rx="55" ry="22" fill="#e8e4dc" opacity="0.3"/>
          <ellipse cx="145" cy="60" rx="50" ry="20" fill="#e8e4dc" opacity="0.3"/>
        </svg>
      </div>

      {/* 山间云雾 */}
      <div className="absolute bottom-[28%] left-[15%] opacity-6">
        <svg width="250" height="60" viewBox="0 0 250 60">
          <ellipse cx="125" cy="35" rx="120" ry="20" fill="#d4d0c8" opacity="0.3"/>
          <ellipse cx="70" cy="40" rx="70" ry="15" fill="#d4d0c8" opacity="0.25"/>
          <ellipse cx="180" cy="40" rx="65" ry="15" fill="#d4d0c8" opacity="0.25"/>
        </svg>
      </div>

      {/* 飘动的云 */}
      <div className="absolute top-[20%] left-[40%] opacity-5">
        <svg width="150" height="70" viewBox="0 0 150 70">
          <ellipse cx="75" cy="45" rx="70" ry="22" fill="#e8e4dc" opacity="0.3"/>
          <ellipse cx="40" cy="48" rx="40" ry="17" fill="#e8e4dc" opacity="0.25"/>
          <ellipse cx="110" cy="48" rx="38" ry="16" fill="#e8e4dc" opacity="0.25"/>
        </svg>
      </div>
    </div>
  );
};

// 星空装饰组件（夜间模式）
export const StarrySky = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden opacity-0 dark:opacity-100 transition-opacity duration-300">
      {/* 星星 - 只在天空部分（前60%） */}
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <pattern id="stars" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="20" r="0.8" fill="#ffffff" opacity="0.6"/>
            <circle cx="35" cy="15" r="0.6" fill="#ffffff" opacity="0.4"/>
            <circle cx="60" cy="25" r="0.7" fill="#ffffff" opacity="0.5"/>
            <circle cx="85" cy="18" r="0.5" fill="#ffffff" opacity="0.3"/>
            <circle cx="20" cy="60" r="0.6" fill="#ffffff" opacity="0.4"/>
            <circle cx="50" cy="55" r="0.8" fill="#ffffff" opacity="0.5"/>
            <circle cx="75" cy="65" r="0.5" fill="#ffffff" opacity="0.3"/>
            <circle cx="95" cy="58" r="0.7" fill="#ffffff" opacity="0.4"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#stars)"/>
      </svg>

      {/* 月亮 */}
      <div className="absolute top-[10%] right-[12%]">
        <svg width="60" height="60" viewBox="0 0 60 60">
          <defs>
            <radialGradient id="moon-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{ stopColor: '#f5f2eb', stopOpacity: 0.9 }} />
              <stop offset="100%" style={{ stopColor: '#e8e4dc', stopOpacity: 0.6 }} />
            </radialGradient>
          </defs>
          <circle cx="30" cy="30" r="25" fill="url(#moon-grad)" opacity="0.8"/>
          {/* 月球纹理 */}
          <circle cx="22" cy="25" r="5" fill="#d4d0c8" opacity="0.3"/>
          <circle cx="35" cy="32" r="4" fill="#d4d0c8" opacity="0.25"/>
          <circle cx="28" cy="38" r="3" fill="#d4d0c8" opacity="0.2"/>
        </svg>
      </div>

      {/* 夜间云雾 */}
      <div className="absolute top-[15%] left-[8%] opacity-10">
        <svg width="200" height="80" viewBox="0 0 200 80">
          <ellipse cx="100" cy="45" rx="90" ry="25" fill="#7fb069" opacity="0.15"/>
          <ellipse cx="60" cy="50" rx="55" ry="20" fill="#7fb069" opacity="0.12"/>
          <ellipse cx="140" cy="50" rx="50" ry="18" fill="#7fb069" opacity="0.12"/>
        </svg>
      </div>

      <div className="absolute bottom-[35%] right-[10%] opacity-8">
        <svg width="220" height="70" viewBox="0 0 220 70">
          <ellipse cx="110" cy="40" rx="100" ry="22" fill="#7fb069" opacity="0.12"/>
          <ellipse cx="70" cy="45" rx="60" ry="18" fill="#7fb069" opacity="0.1"/>
          <ellipse cx="150" cy="45" rx="55" ry="16" fill="#7fb069" opacity="0.1"/>
        </svg>
      </div>
    </div>
  );
};

// 水面星光倒影（夜间模式）
export const WaterReflection = () => {
  return (
    <div className="fixed bottom-0 left-0 w-full h-32 pointer-events-none -z-10 opacity-0 dark:opacity-100 transition-opacity duration-300">
      <svg width="100%" height="100%" viewBox="0 0 1440 128" preserveAspectRatio="none">
        <defs>
          <linearGradient id="water-reflection" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#7fb069', stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: '#4a7c5f', stopOpacity: 0.1 }} />
          </linearGradient>
        </defs>

        {/* 星光倒影 */}
        <g opacity="0.4">
          <rect x="200" y="80" width="2" height="30" fill="url(#water-reflection)">
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="3s" repeatCount="indefinite"/>
          </rect>
          <rect x="450" y="75" width="1.5" height="35" fill="url(#water-reflection)">
            <animate attributeName="opacity" values="0.4;0.7;0.4" dur="2.5s" repeatCount="indefinite"/>
          </rect>
          <rect x="700" y="85" width="2.5" height="28" fill="url(#water-reflection)">
            <animate attributeName="opacity" values="0.3;0.5;0.3" dur="3.5s" repeatCount="indefinite"/>
          </rect>
          <rect x="950" y="78" width="1.8" height="32" fill="url(#water-reflection)">
            <animate attributeName="opacity" values="0.35;0.65;0.35" dur="2.8s" repeatCount="indefinite"/>
          </rect>
          <rect x="1200" y="82" width="2.2" height="30" fill="url(#water-reflection)">
            <animate attributeName="opacity" values="0.3;0.55;0.3" dur="3.2s" repeatCount="indefinite"/>
          </rect>
        </g>

        {/* 波光粼粼 */}
        <g opacity="0.2">
          <ellipse cx="200" cy="100" rx="30" ry="3" fill="#7fb069">
            <animate attributeName="rx" values="25;35;25" dur="2s" repeatCount="indefinite"/>
          </ellipse>
          <ellipse cx="700" cy="105" rx="40" ry="3" fill="#7fb069">
            <animate attributeName="rx" values="35;45;35" dur="2.3s" repeatCount="indefinite"/>
          </ellipse>
          <ellipse cx="1200" cy="98" rx="35" ry="3" fill="#7fb069">
            <animate attributeName="rx" values="30;40;30" dur="2.1s" repeatCount="indefinite"/>
          </ellipse>
        </g>
      </svg>
    </div>
  );
};

// 四君子装饰组件已移除
// 替换为：Clouds（白云）、StarrySky（星空）、WaterReflection（水光）
// 这些元素更符合中国山水画的意境，也更容易识别
