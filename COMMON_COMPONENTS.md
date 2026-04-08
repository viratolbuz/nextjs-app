Done — I set up two separate dummy datasets in your current project:

Development dummy = your current existing data
Production dummy = new dataset (different users/platform mix/projects naming), while keeping status/badge values valid (Active, Inactive, Pending, Connected, Disconnected, Expiring, etc.)
What I implemented
Added new production dummy file:
data/dummy/production.ts
Updated dummy index to expose both datasets:
data/index.ts
exports developmentDummyData and productionDummyData
Updated service switching logic:
services/appData.service.ts
Uses:
NEXT_PUBLIC_USE_DUMMY_DATA=true
NEXT_PUBLIC_ENV=development => development dummy
NEXT_PUBLIC_ENV=production => production dummy
Updated .env.production to use dummy mode:
NEXT_PUBLIC_USE_DUMMY_DATA=true
So now you can run both environments with dummy data but different records.

How environment switching works now
.env.development

NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_USE_DUMMY_DATA=true
Loads development dummy (current data)
.env.production

NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_USE_DUMMY_DATA=true
Loads production dummy (new data)
GitHub upload commands (step-by-step)
Run from your project root:

git checkout -b feat/dual-dummy-env-data
git add .
git commit -m "Add environment-based dual dummy datasets for development and production"
git push -u origin feat/dual-dummy-env-data
Then create PR on GitHub:

Open repo on GitHub
Compare feat/dual-dummy-env-data -> main
Create Pull Request
Merge
If you want direct push to current branch instead:

git add .
git commit -m "Add environment-based dual dummy datasets for development and production"
git push
Netlify setup (step-by-step)
1) Connect repo
Netlify -> Add new site -> Import from Git
Select your GitHub repo and branch (main)
2) Build settings
Build command: npm run build
Publish directory: .next (if using Next.js plugin/runtime)
(Netlify usually auto-detects Next.js; keep default if auto-configured.)
3) Environment variables (Production)
In Netlify -> Site settings -> Environment variables, add:

NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_USE_DUMMY_DATA=true
NEXT_PUBLIC_API_URL=https://your-netlify-domain.netlify.app/api
NEXT_PUBLIC_APP_URL=https://your-netlify-domain.netlify.app
4) Environment variables (Deploy Preview / Dev-like branch)
For preview branch context, set:

NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_USE_DUMMY_DATA=true
NEXT_PUBLIC_API_URL=http://localhost:3000/api (or preview API URL)
NEXT_PUBLIC_APP_URL=https://your-preview-url.netlify.app
5) Trigger deploy
Click Trigger deploy -> Deploy site
If you want, next I can add a tiny debug label (only in console, not UI) that logs which dataset is active (developmentDummyData vs productionDummyData) so deployment verification is instant.