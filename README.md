# GreatYoms Vision

A static cinematography and videography portfolio for Ayomide Osuolale. The site is ready to serve from `dist/`.

## Deploy on Vercel

1. Push this repository to a GitHub account you control.
2. In Vercel, choose **Add New → Project** and import the GitHub repository.
3. Keep the repository root as the Root Directory and choose **Deploy**. The included Vercel configuration serves `dist/` directly without a build or dependency installation.
4. Push updates to `main` to trigger production deployments once the Git connection is active.

No environment variables are required. Video embeds and external social links use their respective services.

## Preview locally

From the repository root, run `python3 -m http.server 8000 --directory dist` and open http://localhost:8000.

The homepage is `dist/index.html`, with separate About and Contact pages. Shared styles and interactions are in `dist/portfolio.css` and `dist/portfolio.js`. Images, fonts, the CV, and the hero video are in `dist/media/`.
