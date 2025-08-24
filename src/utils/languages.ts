export interface Language {
  name: string;
  iconName: string;
  className?: string;
}

export const languages: Record<string, Language> = {
  angular: {
    name: "Angular",
    iconName: "angular",
  },
  astro: {
    name: "Astro",
    iconName: "astro",
  },
  bootstrap: {
    name: "Bootstrap",
    iconName: "bootstrap",
  },
  cloudflare: {
    name: "Cloudflare",
    iconName: "cloudflare",
  },
  html: {
    name: "HTML 5",
    iconName: "html",
  },
  javascript: {
    name: "JavaScript",
    iconName: "javascript",
  },
  mysql: {
    name: "MySQL",
    className: "bg-[#f6ece1]!",
    iconName: "mysql",
  },
  wordpress: {
    name: "Wordpress",
    iconName: "wordpress",
  },
  node: {
    name: "Node.js",
    iconName: "node",
  },
  tailwind: {
    name: "Tailwind CSS",
    iconName: "tailwind",
  },
  figma: {
    name: "Figma",
    iconName: "figma",
  },
  firebase: {
    name: "Firebase",
    iconName: "firebase",
  },
  markdown: {
    name: "Markdown",
    iconName: "markdown",
  },
  php: {
    name: "PHP",
    iconName: "php",
  },
  sass: {
    name: "Sass",
    iconName: "sass",
  },
  ts: {
    name: "TypeScript",
    iconName: "typescript",
  },
  git: {
    name: "Git",
    iconName: "git",
  },
  css: {
    name: "CSS",
    iconName: "css",
  },
  vercel: {
    name: "Vercel",
    iconName: "vercel",
  },
  netlify: {
    name: "Netlify",
    iconName: "netlify",
  },
  gatsby: {
    name: "Gatsby",
    iconName: "gatsby",
  },
  windsurf: {
    name: "Windsurf",
    iconName: "windsurf-logo",
  },
  cursor: {
    name: "Cursor",
    iconName: "cursor-ia",
  },
  deepseek: {
    name: "DeepSeek",
    iconName: "deepseek",
  },
  python: {
    name: "Python",
    iconName: "python",
  },
  aws: {
    name: "AWS",
    iconName: "aws",
  },
  postgresql: {
    name: "PostgreSQL",
    iconName: "postgresql",
  },
  tensorflow: {
    name: "TensorFlow",
    iconName: "tensorflow",
  },
  pytorch: {
    name: "PyTorch",
    iconName: "pytorch",
  },
  matplotlib: {
    name: "Matplotlib",
    iconName: "matplotlib",
  },
  seaborn: {
    name: "Seaborn",
    iconName: "seaborn",
  },
  jupyter: {
    name: "Jupyter",
    iconName: "jupyter",
  },
  r: {
    name: "R",
    iconName: "r",
  },
  airbyte: {
    name: "Airbyte",
    iconName: "airbyte",
  },
  dbt: {
    name: "dbt",
    iconName: "dbt",
  },
  vscode: {
    name: "VS Code",
    iconName: "vscode",
  },
  docker: {
    name: "Docker",
    iconName: "docker",
  },
  kubernetes: {
    name: "Kubernetes",
    iconName: "kubernetes",
  },
  airflow: {
    name: "Airflow",
    iconName: "airflow",
  },
  fastapi: {
    name: "FastAPI",
    iconName: "fastapi",
  },
  flask: {
    name: "Flask",
    iconName: "flask",
  },
  linux: {
    name: "Linux",
    iconName: "linux",
  },
  terraform: {
    name: "Terraform",
    iconName: "terraform",
  },
  numpy: {
    name: "NumPy",
    iconName: "numpy",
  },
  pandas: {
    name: "Pandas",
    iconName: "pandas",
  },
  scikit: {
    name: "Scikit-learn",
    iconName: "scikit-learn",
  },
  powerbi: {
    name: "Power BI",
    iconName: "powerbi",
  },
  mongodb: {
    name: "MongoDB",
    iconName: "mongodb",
  },  
  kafka: {
    name: "Kafka",
    iconName: "kafka",
  },
  spark: {
    name: "Apache Spark",
    iconName: "spark",
  },

};

export const getLanguage = (lang: string): Language => {
  return languages[lang] || languages.html;
}; 