/* ==========================================================
   PHOTO MANIFEST — the only file you edit to add photographs.
   ----------------------------------------------------------
   Every placeholder on the page has an id (its data-photo
   attribute). To replace a placeholder:

     1. Put your image file in the /images folder.
     2. Type its path into `src` below, e.g.  "images/roundabout.jpg"
        (relative path, no leading slash — this keeps GitHub Pages happy).
     3. Rewrite `alt` so it describes what the photograph really shows.
     4. Optional: `pos` is the focal point used when the photo is
        cropped to fit its frame, e.g. "50% 30%" (x y). Default "50% 50%".

   While `src` is "" the placeholder stays, and nothing is requested
   from the server. See README.md for aspect ratios and sizes.
   ========================================================== */

window.TOWN_PHOTOS = {

  /* — Prologue · The Roundabout — */
  "roundabout":         { src: "images/roundabout.jpg", alt: "The campus roundabout seen from above, ringed by palms.", pos: "50% 50%" },
  "campus-surround":    { src: "", alt: "The buildings and paths surrounding the roundabout.", pos: "50% 50%" },
  "aerial-palms":       { src: "", alt: "Looking down over palm trees from an upper floor.", pos: "50% 50%" },

  /* — I · The Gate — */
  "gate-sign":          { src: "", alt: "The university name on the wall: BITS Pilani, Dubai Campus.", pos: "50% 50%" },
  "atrium":             { src: "", alt: "The campus atrium in the morning.", pos: "50% 50%" },
  "atrium-wide":        { src: "", alt: "The atrium from a distance, people starting to fill it.", pos: "50% 50%" },

  /* — II · Market Road — */
  "canteen-fridge":     { src: "", alt: "The canteen fridge stocked with drinks.", pos: "50% 50%" },
  "food-stall":         { src: "", alt: "A food stall under a red tent.", pos: "50% 50%" },
  "foosball":           { src: "", alt: "A foosball table between classes.", pos: "50% 50%" },

  /* — III · The Town Hall — */
  "town-hall-banners":  { src: "", alt: "The wide atrium hung with banners, a crowd below.", pos: "50% 50%" },
  "stairs-crowd":       { src: "", alt: "Students gathered on the atrium stairs.", pos: "50% 50%" },
  "wide-hall":          { src: "", alt: "A wide view of the busy atrium hall.", pos: "50% 50%" },

  /* — IV · The Stadium — */
  "badminton-hall":     { src: "", alt: "The badminton hall set up for the tournament.", pos: "50% 50%" },
  "badminton-match":    { src: "", alt: "A badminton match in progress.", pos: "50% 50%" },
  "bsf-banner":         { src: "", alt: "The BSF 2025 banner hanging in the hall.", pos: "50% 50%" },
  "folding-chairs":     { src: "", alt: "Rows of folding chairs beside the court.", pos: "50% 50%" },
  "spectators":         { src: "", alt: "Spectators watching the match.", pos: "50% 50%" },

  /* — V · Gossip Corner — */
  "steps-talking":      { src: "", alt: "Two people sitting and talking on the entrance steps.", pos: "50% 50%" },

  /* — VI · The Bazaar Stall — */
  "acmw-booth":         { src: "", alt: "The ACM-W booth with a pink tablecloth, a laptop and a small crowd.", pos: "50% 50%" },

  /* — VII · The Bulletin Board — */
  "whiteboard-note":    { src: "", alt: "A whiteboard with a handwritten lost-and-found note.", pos: "50% 50%" },

  /* — VIII · The Colonnade — */
  "colonnade-arches":   { src: "", alt: "Arches along the colonnade.", pos: "50% 50%" },
  "ivy-walls":          { src: "", alt: "Ivy covering a courtyard wall.", pos: "50% 50%" },
  "courtyard-walkway":  { src: "", alt: "A courtyard walkway with almost nobody on it.", pos: "50% 50%" },
  "quiet-path":         { src: "", alt: "A quiet path through the campus.", pos: "50% 50%" },

  /* — IX · The Last Bus — */
  "group-trees":        { src: "", alt: "A group of students talking under the trees.", pos: "50% 50%" },
  "golden-path":        { src: "", alt: "A campus path in golden-hour light, bags on shoulders.", pos: "50% 50%" },
  "vans":               { src: "", alt: "The university vans waiting to leave.", pos: "50% 50%" },
  "golden-hour-wide":   { src: "", alt: "Campus paths glowing in golden-hour light.", pos: "50% 50%" },
  "evening":            { src: "", alt: "The campus in the last evening light.", pos: "50% 50%" },

  /* — Ending — */
  "roundabout-evening": { src: "", alt: "The roundabout again, now in evening light.", pos: "50% 50%" }
};
