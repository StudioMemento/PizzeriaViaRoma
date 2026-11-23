export const phoneNumber = "0427 541 232";
export const phoneHref = `tel:+39${phoneNumber.replaceAll(" ", "")}`;

// Google Maps place identifier from the restaurant’s supplied link.
export const mapUrl = "https://maps.google.com/?cid=7212905066552907909";
const placeId = "0x477983a3cc4c3b4f:0x641962f142805885";
export const photosUrl = `https://www.google.com/maps/place//data=!4m3!3m2!1s${placeId}!10e5`;
export const reviewsUrl = `https://www.google.com/maps/place//data=!4m4!3m3!1s${placeId}!9m1!1b1`;

export const socialProfiles = [
  { id: "instagram", artHeight: 640, name: "Instagram", href: "https://www.instagram.com/pizzeriaviaromamaniago/" },
  { id: "facebook", artHeight: 640, name: "Facebook", href: "https://www.facebook.com/people/Pizzeria-Via-Roma/61562436140782/" },
  { id: "google", artHeight: 640, name: "Google Reviews", href: reviewsUrl },
  { id: "tripadvisor", artHeight: 320, name: "Tripadvisor", href: "https://www.tripadvisor.it/Restaurant_Review-g790406-d20931745-Reviews-Pizzeria_Via_Roma-Maniago_Province_of_Pordenone_Friuli_Venezia_Giulia.html" },
  { id: "guru", artHeight: 320, name: "Restaurant Guru", href: "https://restaurantguru.it/Pizzeria-Via-Roma-Maniago" },
  { id: "sluurpy", artHeight: 320, name: "Sluurpy", href: "https://www.sluurpy.it/maniago/ristorante/270651/pizzeria-via-roma" },
];
