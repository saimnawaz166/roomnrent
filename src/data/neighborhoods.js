// Neighborhood directory — powers the /neighborhoods/:slug landing pages,
// the Browse filter, and the "Browse by neighborhood" strip on the homepage.
export const NEIGHBORHOODS = [
  {
    slug: 'mission-bay',
    name: 'Mission Bay',
    city: 'San Francisco, CA',
    intro:
      "Mission Bay sits right on the waterfront, a short walk from Chase Center and Caltrain. It's a newer part of the city with wide sidewalks, a lot of biotech and tech offices nearby, and easy access to the Embarcadero.",
  },
  {
    slug: 'capitol-hill',
    name: 'Capitol Hill',
    city: 'Seattle, WA',
    intro:
      "Capitol Hill is one of Seattle's most walkable neighborhoods — coffee shops, live music venues, and a dense strip of restaurants, all a few minutes from downtown by light rail.",
  },
  {
    slug: 'downtown-austin',
    name: 'Downtown',
    city: 'Austin, TX',
    intro:
      'Downtown Austin puts you within walking distance of Lady Bird Lake, Sixth Street, and the Capitol. Expect a lively, walkable core with quick access to the rest of the city via the Red Line.',
  },
  {
    slug: 'wicker-park',
    name: 'Wicker Park',
    city: 'Chicago, IL',
    intro:
      "Wicker Park has a strong indie retail and music scene, tree-lined residential streets, and easy Blue Line access into the Loop. It's a favorite for renters who want character housing over high-rises.",
  },
  {
    slug: 'tech-corridor',
    name: 'Tech Corridor',
    city: 'Denver, CO',
    intro:
      "Denver's Tech Corridor is close to major employers and the light rail, with newer construction mixed in among older single-family blocks — a practical pick for a short commute.",
  },
  {
    slug: 'fenway',
    name: 'Fenway',
    city: 'Boston, MA',
    intro:
      'Fenway is a classic college-town pocket of Boston — walkable, close to the Green Line, and full of the kind of shared houses that make sense for grad students and young professionals alike.',
  },
  {
    slug: 'laurelhurst',
    name: 'Laurelhurst',
    city: 'Portland, OR',
    intro:
      'Laurelhurst is a quieter, tree-heavy residential neighborhood built around its namesake park, with a short bus ride into downtown Portland and a strong sense of block-by-block community.',
  },
  {
    slug: 'silver-lake',
    name: 'Silver Lake',
    city: 'Los Angeles, CA',
    intro:
      'Silver Lake is known for its hillside Craftsman homes, independent coffee shops, and reservoir walking loop — a laid-back, design-forward pocket of LA a short drive from downtown.',
  },
];

export function getNeighborhoodBySlug(slug) {
  return NEIGHBORHOODS.find((n) => n.slug === slug);
}
