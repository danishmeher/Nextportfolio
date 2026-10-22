type PortfolioData = {
  projects: any[];
  skills: any[];
  experiences: any[];
};

let cachedPortfolioData: PortfolioData | null = null;
let inFlightPromise: Promise<PortfolioData | null> | null = null;

export async function getClientPortfolioData(): Promise<PortfolioData | null> {
  if (cachedPortfolioData) {
    return cachedPortfolioData;
  }

  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = fetch("/api/portfolio")
    .then((res) => (res.ok ? res.json() : null))
    .then((data: PortfolioData | null) => {
      if (data) {
        cachedPortfolioData = data;
      }
      return data;
    })
    .catch((err) => {
      console.warn("Portfolio client fetch error:", err);
      return null;
    })
    .finally(() => {
      inFlightPromise = null;
    });

  return inFlightPromise;
}
