import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════
   CULTURAL DATABASE — 20 Items from East Java
═══════════════════════════════════════════════════════════ */
const CULTURE_DB = [
  { id:1, name:"Kebo-keboan", origin:"Banyuwangi, East Java", category:"Ritual Ceremony", emoji:"🐃",
    wikiTitle:"Kebo-keboan",
    bg:"linear-gradient(135deg,#8B5E3C,#C4956A)",
    card:"An agrarian ritual where humans transform into buffalo figures to call upon ancestral blessings for a bountiful harvest.",
    detail:"A traditional ceremony by the Osing people where participants dress as buffaloes and plow the fields, symbolizing humanity's harmony with nature and gratitude to the Earth.",
    symbolism:"Black charcoal paint on the body represents the strength and grounding force of the earth.",
    metaphor:"The Human-Buffalo transformation stands as a metaphor for setting aside the ego to serve the survival of the community.",
    translation:"Kebo-keboan is a reduplication of Kebo (buffalo), where the suffix -an signals mimicry or resemblance." },
  { id:2, name:"Temanten Kucing", origin:"Tulungagung, East Java", category:"Ritual Ceremony", emoji:"🐱",
    wikiTitle:"Temanten Kucing",
    bg:"linear-gradient(135deg,#E74C3C,#FFB347)",
    card:"A unique zoomorphic wedding ritual performed to petition the heavens for rain during extreme droughts.",
    detail:"A rain-invoking ritual involving the symbolic marriage of two cats, paraded and bathed in a sacred spring following the structure of a traditional Javanese wedding.",
    symbolism:"Bathing the cats symbolizes the cleansing of the land and the tears of the sky — rain.",
    metaphor:"The cat represents a pure, domestic soul whose discomfort during bathing is believed to trigger celestial sympathy.",
    translation:"Temanten (Bride/Groom) + Kucing (Cat) — literally 'The Cat Wedding.'" },
  { id:3, name:"Tari Seblang Bakungan", origin:"Banyuwangi, East Java", category:"Traditional Dance / Ritual", emoji:"💃",
    wikiTitle:"Seblang",
    bg:"linear-gradient(135deg,#9B59B6,#E056FD)",
    card:"An ancient trance ritual performed by elderly women to maintain spiritual equilibrium and protect the village from misfortune.",
    detail:"Performed by post-menopausal women in Bakungan village, this trance dance serves as communal exorcism to ward off bad luck (Tolak Bala).",
    symbolism:"The Omprok headdress of banana leaves and flowers represents the cycle of life and rebirth.",
    metaphor:"The dancer's trance bridges the mundane world and the ancestral realm.",
    translation:"Seblang is often interpreted as Sebele Ilang — meaning the bad luck is gone." },
  { id:4, name:"Topeng Malangan", origin:"Malang, East Java", category:"Performing Art / Mask Drama", emoji:"🎭",
    wikiTitle:"Topeng Malang",
    bg:"linear-gradient(135deg,#C0392B,#E74C3C)",
    card:"A kinetic storytelling medium where hand-carved wooden masks breathe life into the epic Panji cycles.",
    detail:"A traditional mask dance drama from Malang portraying the romantic and heroic tales of Raden Panji, with specific character colors and expressions.",
    symbolism:"Mask colors act as visual language: Red for passion, White for purity, and Green for noble intent.",
    metaphor:"Wearing the mask is a metaphor for adopting a social role — echoing the Latin word Persona, which means mask.",
    translation:"Topeng (Mask) + Malangan (of Malang style)." },
  { id:5, name:"Larung Sembonyo", origin:"Trenggalek, East Java", category:"Ritual Ceremony", emoji:"⛵",
    wikiTitle:"Larung sesaji",
    bg:"linear-gradient(135deg,#1A6FA0,#48CAE4)",
    card:"A maritime offering ritual commemorating ancestral legends and expressing gratitude for the sea's abundance.",
    detail:"A sea-offering ritual at Prigi Beach where a miniature ship filled with offerings is floated into the ocean, honoring the legend of a wedding between a human and a sea deity.",
    symbolism:"Floating the offerings represents letting go of greed and returning blessings to their source.",
    metaphor:"The ocean stands as a metaphor for the vast, uncontrollable power of the Divine.",
    translation:"Larung (to float away) + Sembonyo (referring to traditional bride and groom effigies)." },
  { id:6, name:"Tiban", origin:"Trenggalek / Pacitan, East Java", category:"Traditional Sport / Ritual", emoji:"⚡",
    wikiTitle:"Tiban (game)",
    bg:"linear-gradient(135deg,#4A4A4A,#888888)",
    card:"A sacred whip duel traditionally associated with prayers for rain and the arrival of the monsoon season.",
    detail:"A ritual whip fight between two men using whips made from sugar palm leaf ribs, traditionally performed to request rain from the sky.",
    symbolism:"The scars left by the whip represent the cracks in the dry earth awaiting water.",
    metaphor:"The duel embodies the masculine struggle against the harshness of nature.",
    translation:"Tiban derives from Tiba (to fall), referring to rain falling from the sky." },
  { id:7, name:"Reog Ponorogo", origin:"Ponorogo, East Java", category:"Traditional Performing Art", emoji:"🦁",
    wikiTitle:"Reog",
    bg:"linear-gradient(135deg,#D4AC0D,#F39C12)",
    card:"A grand synthesis of physical prowess and mystical narrative, manifested through the iconic lion-peacock mask.",
    detail:"A world-famous performance featuring the Dadak Merak — a massive tiger-head mask adorned with peacock feathers, weighing up to 50kg, carried solely by the dancer's teeth.",
    symbolism:"The tiger mask represents courage and power; the peacock feathers represent elegance, authority, and spiritual beauty.",
    metaphor:"The entire performance is interpreted as the triumph of strategy and cultural expression over raw physical power.",
    translation:"Possibly from Riyok (Javanese: festive noise) or Ma'rufun (Arabic: known / goodness)." },
  { id:8, name:"Ludruk", origin:"Jombang / Surabaya, East Java", category:"Traditional Folk Theater", emoji:"🎪",
    wikiTitle:"Ludruk",
    bg:"linear-gradient(135deg,#16A085,#1ABC9C)",
    card:"East Java's people's theater — a rowdy blend of satire, song, and social critique wrapped in laughter.",
    detail:"A folk drama performed by an all-male cast, including men in female roles, known for its egalitarian language and sharp social commentary.",
    symbolism:"Cross-dressing (Travesthy) symbolizes social inversion and the fluidity of identity.",
    metaphor:"A Democracy in sequins — using humor as a political assertion against injustice.",
    translation:"Derived from Ludh-ludh (to be flexible) or Luthur (to speak humorously)." },
  { id:9, name:"Tumpeng", origin:"East Java (General Java)", category:"Gastronomy / Ritual Food", emoji:"🍚",
    wikiTitle:"Tumpeng",
    bg:"linear-gradient(135deg,#B7950B,#F1C40F)",
    card:"A culinary representation of the Javanese cosmos, where earth and heaven converge at a single peak.",
    detail:"Cone-shaped yellow rice surrounded by seven types of side dishes, traditionally served during Selamatan to mark important life events.",
    symbolism:"The cone shape represents the sacred mountain (Gunungan), the dwelling place of deities and ancestors in Javanese cosmology.",
    metaphor:"The side dishes represent the diverse elements of life harmonized on one plate.",
    translation:"Folk etymology interprets it as Tumapak ing lempeng — to live honestly and with integrity." },
  { id:10, name:"Rawon", origin:"East Java", category:"Gastronomy", emoji:"🍲",
    wikiTitle:"Rawon",
    bg:"linear-gradient(135deg,#1C1C1C,#555555)",
    card:"A legendary black beef soup characterized by the rich, earthy depth of the fermented kluwek nut.",
    detail:"A deep-black beef soup cited as one of the world's best soups, using kluwek (Pangium edule) for its signature color and nutty flavor.",
    symbolism:"The black color represents deep wisdom within Javanese philosophy — the concept of Warna Ireng.",
    metaphor:"Rawon is called Black Gold — a metaphor for humble appearances concealing extraordinary richness.",
    translation:"Derived from the Old Javanese root Raru, referring to dark coloring agents in traditional culinary arts." },
  { id:11, name:"Karapan Sapi", origin:"Madura, East Java", category:"Traditional Sport", emoji:"🐂",
    wikiTitle:"Kerapan sapi",
    bg:"linear-gradient(135deg,#7D3C0A,#CA6F1E)",
    card:"A prestigious bull racing event showcasing the strength, pride, and competitive spirit of the Madurese people.",
    detail:"A high-speed bull race where a pair of bulls pulls a wooden sled (Kaleles) with a jockey, covering 100 meters in mere seconds.",
    symbolism:"The bulls represent the vitality and resilience of the people in the arid land of Madura.",
    metaphor:"The race reflects the struggle to achieve social status and honor — the Madurese concept of Harga Diri.",
    translation:"Derived from Kerap, meaning to organize or to race." },
  { id:12, name:"Selamatan Ketupat", origin:"Bondowoso, East Java", category:"Ritual Ceremony / Gastronomy", emoji:"🍱",
    wikiTitle:"Ketupat",
    bg:"linear-gradient(135deg,#1E8449,#2ECC71)",
    card:"A communal thanksgiving ritual celebrating peace and spiritual unity through the sharing of traditional rice cakes.",
    detail:"A unique ritual in Bondowoso villages where people gather to pray and exchange Ketupat and Serabi, symbolizing the washing away of sins and social friction.",
    symbolism:"The intricate weaving of Ketupat represents the complexity of human errors; the white rice inside stands for purity after forgiveness.",
    metaphor:"The soft texture of Serabi is a metaphor for the gentleness needed in community relations.",
    translation:"Ketupat comes from Ngaku Lepat — admitting one's mistakes." },
  { id:13, name:"Ritual Seblang Olehsari", origin:"Banyuwangi, East Java", category:"Traditional Dance / Ritual", emoji:"🌸",
    wikiTitle:"Seblang",
    bg:"linear-gradient(135deg,#C0327A,#F472B6)",
    card:"A youthful iteration of the Seblang ritual, performed by a maiden traditionally associated with hopes for agricultural prosperity.",
    detail:"Performed annually in Olehsari village for seven consecutive days after Eid al-Fitr, featuring a young girl in a trance wearing a mask of flowers.",
    symbolism:"Fresh flowers in the headdress symbolize youth, fertility, and the flourishing of crops.",
    metaphor:"The seven-day duration represents the cycle of the week and the continuity of time.",
    translation:"Olehsari refers to the village name, which literally means obtaining the essence or finding the core." },
  { id:14, name:"Tumpeng Sewu", origin:"Banyuwangi, East Java", category:"Ritual Ceremony", emoji:"🕯️",
    wikiTitle:"Tumpeng sewu",
    bg:"linear-gradient(135deg,#B7440A,#E67E22)",
    card:"A village-wide ritual of a thousand cones that transforms a shared meal into a spiritual shield for the community.",
    detail:"A massive ritual in Kemiren village where every household serves Tumpeng Pecel Pitik at their doorstep to foster solidarity and ward off misfortune.",
    symbolism:"The number thousand (Sewu) represents infinity and the collective strength of the community.",
    metaphor:"The row of Tumpeng along the street forms a metaphor for a protective wall built from unity.",
    translation:"Tumpeng (Rice cone) + Sewu (Thousand)." },
  { id:15, name:"Pecel Madiun", origin:"Madiun, East Java", category:"Gastronomy", emoji:"🥜",
    wikiTitle:"Pecel",
    bg:"linear-gradient(135deg,#7D5A1A,#D4A017)",
    card:"A vibrant vegetable ensemble harmonized by a spicy peanut sauce, traditionally served on a folded banana leaf.",
    detail:"A signature dish of Madiun featuring steamed vegetables with a distinctively spicy, citrusy peanut sauce, often served in a Pincuk (banana leaf).",
    symbolism:"The variety of vegetables represents community diversity; the peanut sauce symbolizes social cohesion by binding diverse ingredients into one dish.",
    metaphor:"Pecel proves humble ingredients can create something extraordinary — a metaphor for simplicity as a virtue.",
    translation:"Pecel derives from the Javanese verb Mecel, meaning to crush or press — referring to the peanut-grinding process." },
  { id:16, name:"Tari Remo", origin:"Surabaya / Jombang, East Java", category:"Traditional Dance", emoji:"💫",
    wikiTitle:"Remo (dance)",
    bg:"linear-gradient(135deg,#1565C0,#1CB0F6)",
    card:"A dynamic welcoming dance symbolizing a prince's bravery, characterized by rhythmic bells and powerful leg movements.",
    detail:"Originally a dance to open Ludruk performances, Tari Remo is now East Java's official welcoming dance, showcasing the bold and open Arek spirit of Surabaya.",
    symbolism:"The Gongseng ankle bells symbolize the heartbeat of the land and the alertness of a warrior.",
    metaphor:"The wide, low stance of the dancer represents being down to earth (Rendah Hati) while remaining strong.",
    translation:"Derived from Reyange (vibrant facial expression) and Momo (masculine spirit)." },
  { id:17, name:"Sate Madura", origin:"Madura, East Java", category:"Gastronomy", emoji:"🍢",
    wikiTitle:"Satay",
    bg:"linear-gradient(135deg,#CC3000,#FF7043)",
    card:"A global culinary icon featuring skewered grilled chicken served with a velvety, rich peanut sauce.",
    detail:"Perhaps the most famous Indonesian satay, known for its fine peanut sauce and sweet soy sauce, representing the entrepreneurial spirit of the Madurese people who spread this dish worldwide.",
    symbolism:"The skewer (Tusuk) represents unity — bringing diverse pieces together into one whole.",
    metaphor:"Grilling over charcoal is a metaphor for the refinement of character through heat and pressure.",
    translation:"The term Sate reflects the phonetic adaptation of regional dialects into the national Indonesian language." },
  { id:18, name:"Entas-entas", origin:"Tengger, East Java", category:"Ritual Ceremony", emoji:"🙏",
    wikiTitle:"Tengger people",
    bg:"linear-gradient(135deg,#5B2C8D,#9B59B6)",
    card:"A sacred Tenggerese ritual believed to help the soul transition peacefully into the ancestral realm.",
    detail:"A post-mortuary ritual by the Tengger Hindu community using Petra (soul effigies) made of woven bamboo and flowers to release the spirit from earthly attachments.",
    symbolism:"The Petra effigy, made of woven bamboo and flowers, represents the human body and its earthly spirit.",
    metaphor:"Lifting the effigy is a metaphor for the soul ascending beyond the physical world.",
    translation:"Derived from the Javanese word Entas, meaning to lift out or to rescue from a state of being." },
  { id:19, name:"Jaranan", origin:"Kediri / Tulungagung, East Java", category:"Performing Art / Dance", emoji:"🐴",
    wikiTitle:"Jaran kepang",
    bg:"linear-gradient(135deg,#5D4037,#A1887F)",
    card:"A spirited horse dance depicting a troop of cavalrymen, often involving mystical elements and communal trance.",
    detail:"A traditional performance using woven bamboo horses (Jaran Kepang), depicting historical heroes and often culminating in a trance state called Ndadi.",
    symbolism:"The bamboo horse represents the agility and fighting spirit of the Javanese cavalry.",
    metaphor:"The Ndadi (trance) state represents the entry of divine or ancestral inspiration into human action.",
    translation:"Jaran (Horse) + suffix -an (mimicry of)." },
  { id:20, name:"Manten Tebu", origin:"Jombang / Kediri, East Java", category:"Ritual Ceremony / Tradition", emoji:"🎋",
    wikiTitle:"Sugarcane",
    bg:"linear-gradient(135deg,#145A32,#27AE60)",
    card:"A symbolic wedding of sugarcane stalks performed to ensure a sweet and abundant harvest for the local sugar industry.",
    detail:"Performed before the milling season in sugar factories, where two sugarcane stalks are dressed as a bride and groom to bring sweetness and safety to the workers.",
    symbolism:"The sweetness of sugarcane represents hope for a prosperous life and sweet results from hard labor.",
    metaphor:"The marriage symbolizes the union between human effort and the natural potential of the land.",
    translation:"Manten (Bride/Groom) + Tebu (Sugar Cane)." }
];

const DIFF = {
  easy:   { pairs:4, base:10, time:90,  label:"Easy",   dot:"🟢", color:"#58CC02", dark:"#45A800" },
  medium: { pairs:6, base:20, time:150, label:"Medium",  dot:"🟡", color:"#FFB020", dark:"#E09000" },
  hard:   { pairs:8, base:30, time:210, label:"Hard",    dot:"🔴", color:"#FF4B4B", dark:"#D93B3B" }
};

function shuffle(arr) {
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}

/* ═══════════════════════════════════════════════════════════
   WIKIPEDIA IMAGE FETCHING
═══════════════════════════════════════════════════════════ */
const imageCache = {};

async function fetchWikiImage(item, setImages) {
  if (imageCache[item.id] !== undefined) return;
  imageCache[item.id] = null; // mark as in-progress
  try {
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(item.wikiTitle)}&prop=pageimages&format=json&pithumbsize=600&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = Object.values(data.query.pages);
    const src = pages[0]?.thumbnail?.source;
    if (src) {
      imageCache[item.id] = src;
      setImages(prev => ({ ...prev, [item.id]: src }));
    }
  } catch (e) {}
}

/* ═══════════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════════ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Nunito',sans-serif;background:#FFF9F0;color:#3C3C3C;overflow-x:hidden;}
  ::-webkit-scrollbar{width:6px;}::-webkit-scrollbar-track{background:#f1e8d0;}::-webkit-scrollbar-thumb{background:#c8a96e;border-radius:3px;}
  .nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(255,249,240,0.95);backdrop-filter:blur(10px);border-bottom:2px solid #F0E0C0;display:flex;align-items:center;justify-content:space-between;padding:0 2rem;height:64px;}
  .nav-logo{font-family:'Fredoka One',cursive;font-size:1.5rem;color:#58CC02;display:flex;align-items:center;gap:8px;cursor:pointer;}
  .nav-logo span{color:#FFB020;}
  .nav-links{display:flex;gap:1.5rem;align-items:center;}
  .nav-link{font-weight:700;font-size:.9rem;color:#5A5A5A;cursor:pointer;transition:color .2s;text-decoration:none;padding:4px 0;border-bottom:2px solid transparent;}
  .nav-link:hover{color:#58CC02;border-bottom-color:#58CC02;}
  .nav-btn{background:#58CC02;color:#fff;font-family:'Nunito',sans-serif;font-weight:800;font-size:.9rem;padding:8px 18px;border:none;border-radius:12px;cursor:pointer;transition:all .2s;border-bottom:3px solid #45A800;}
  .nav-btn:hover{background:#50B800;transform:translateY(-1px);}
  .nav-btn:active{transform:translateY(1px);border-bottom-width:1px;}

  /* HERO */
  .hero{min-height:100vh;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;padding-top:64px;}
  .hero-bg{position:absolute;inset:0;background:linear-gradient(135deg,#FFF5E0 0%,#FFF9F0 50%,#F0FFF0 100%);}
  .hero-pattern{position:absolute;inset:0;opacity:.04;background-image:repeating-linear-gradient(45deg,#58CC02 0,#58CC02 1px,transparent 0,transparent 50%),repeating-linear-gradient(-45deg,#FFB020 0,#FFB020 1px,transparent 0,transparent 50%);background-size:30px 30px;}
  .hero-content{position:relative;text-align:center;max-width:700px;padding:2rem;}
  .hero-badge{display:inline-block;background:#E8F8E8;color:#45A800;font-weight:800;font-size:.8rem;padding:6px 16px;border-radius:20px;margin-bottom:1.5rem;border:2px solid #B8ECAA;letter-spacing:.5px;}
  .hero-title{font-family:'Fredoka One',cursive;font-size:4rem;line-height:1.1;margin-bottom:1rem;}
  .hero-title .line1{color:#3C3C3C;}
  .hero-title .line2{color:#58CC02;display:block;}
  .hero-sub{font-size:1.15rem;color:#666;line-height:1.7;margin-bottom:2.5rem;max-width:520px;margin-left:auto;margin-right:auto;}
  .hero-btns{display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;}
  .btn-primary{background:#58CC02;color:#fff;font-family:'Nunito',sans-serif;font-weight:800;font-size:1.1rem;padding:14px 32px;border:none;border-radius:14px;cursor:pointer;transition:all .2s;border-bottom:4px solid #45A800;display:inline-flex;align-items:center;gap:8px;}
  .btn-primary:hover{background:#50B800;transform:translateY(-2px);box-shadow:0 8px 25px rgba(88,204,2,.3);}
  .btn-primary:active{transform:translateY(1px);border-bottom-width:2px;}
  .btn-secondary{background:#fff;color:#58CC02;font-family:'Nunito',sans-serif;font-weight:800;font-size:1.1rem;padding:14px 32px;border:2px solid #58CC02;border-radius:14px;cursor:pointer;transition:all .2s;}
  .btn-secondary:hover{background:#F0FFF0;transform:translateY(-2px);}

  /* FLOATING CARDS IN HERO */
  .float-cards{position:absolute;width:100%;height:100%;pointer-events:none;}
  .float-card{position:absolute;background:#fff;border-radius:16px;padding:12px 16px;box-shadow:0 8px 24px rgba(0,0,0,.08);border:2px solid #F0E0C0;font-size:1.4rem;font-weight:800;display:flex;align-items:center;gap:8px;animation:float 6s ease-in-out infinite;}
  .float-card .fc-label{font-size:.7rem;font-weight:700;color:#999;display:block;}
  .float-card .fc-name{font-size:.9rem;font-weight:800;color:#3C3C3C;}
  @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-12px);}}
  .fc1{top:18%;left:6%;animation-delay:0s;}
  .fc2{top:22%;right:5%;animation-delay:1.5s;}
  .fc3{bottom:22%;left:4%;animation-delay:3s;}
  .fc4{bottom:18%;right:6%;animation-delay:4.5s;}

  /* SECTIONS */
  .section{padding:5rem 2rem;}
  .section-inner{max-width:1100px;margin:0 auto;}
  .section-label{font-size:.8rem;font-weight:800;letter-spacing:2px;color:#FFB020;text-transform:uppercase;margin-bottom:.5rem;}
  .section-title{font-family:'Fredoka One',cursive;font-size:2.5rem;color:#3C3C3C;margin-bottom:1rem;}
  .section-sub{font-size:1rem;color:#666;line-height:1.7;max-width:560px;}
  .section-alt{background:linear-gradient(135deg,#F0FFF0,#FFF9F0);}

  /* ABOUT */
  .about-grid{display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center;margin-top:3rem;}
  .about-features{display:grid;gap:1.2rem;margin-top:2rem;}
  .feature-card{background:#fff;border-radius:16px;padding:1.2rem 1.5rem;display:flex;align-items:flex-start;gap:1rem;border:2px solid #F0E0C0;transition:all .2s;}
  .feature-card:hover{border-color:#58CC02;transform:translateX(4px);}
  .feature-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;}
  .feature-text h4{font-weight:800;font-size:.95rem;margin-bottom:.2rem;}
  .feature-text p{font-size:.85rem;color:#777;line-height:1.5;}
  .about-visual{background:linear-gradient(135deg,#58CC02,#45A800);border-radius:24px;padding:2.5rem;text-align:center;color:#fff;position:relative;overflow:hidden;}
  .about-visual::before{content:'';position:absolute;inset:0;background:repeating-linear-gradient(45deg,rgba(255,255,255,.05) 0,rgba(255,255,255,.05) 1px,transparent 0,transparent 50%);background-size:20px 20px;}
  .about-stat{position:relative;margin-bottom:1.5rem;}
  .about-stat h3{font-family:'Fredoka One',cursive;font-size:3rem;margin-bottom:.2rem;}
  .about-stat p{font-weight:700;opacity:.85;font-size:.9rem;}

  /* GAME MODES PREVIEW */
  .modes-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;margin-top:3rem;}
  .mode-preview{background:#fff;border-radius:20px;padding:2rem;text-align:center;border:2px solid #F0E0C0;transition:all .25s;cursor:pointer;}
  .mode-preview:hover{border-color:#58CC02;transform:translateY(-4px);box-shadow:0 16px 40px rgba(88,204,2,.15);}
  .mode-icon{font-size:3rem;margin-bottom:1rem;display:block;}
  .mode-preview h3{font-family:'Fredoka One',cursive;font-size:1.3rem;color:#3C3C3C;margin-bottom:.5rem;}
  .mode-preview p{font-size:.87rem;color:#777;line-height:1.6;}
  .mode-tag{display:inline-block;margin-top:1rem;font-size:.75rem;font-weight:800;padding:4px 12px;border-radius:8px;color:#fff;}

  /* TEAM */
  .team-grid{display:flex;flex-wrap:wrap;justify-content:center;gap:1.2rem;margin-top:3rem;}
  .team-card{background:#fff;border-radius:20px;padding:1.6rem 1rem;text-align:center;border:2px solid #F0E0C0;transition:all .2s;flex:0 0 calc(20% - 1rem);min-width:160px;max-width:220px;}
  .team-card:hover{transform:translateY(-4px);border-color:#FFB020;box-shadow:0 12px 32px rgba(255,176,32,.2);}
  .team-avatar{width:88px;height:88px;border-radius:50%;display:block;margin:0 auto 1rem;border:3px solid #F0E0C0;object-fit:cover;background:#F5F5F5;}
  .team-name{font-weight:800;font-size:.88rem;margin-bottom:.3rem;line-height:1.3;}
  .team-role{font-size:.75rem;color:#888;font-weight:600;line-height:1.4;}

  /* GAME HUB */
  .hub{min-height:100vh;padding:80px 2rem 2rem;background:linear-gradient(135deg,#F0FFF0,#FFF9F0);}
  .hub-inner{max-width:960px;margin:0 auto;}
  .hub-title{font-family:'Fredoka One',cursive;font-size:2.2rem;color:#3C3C3C;text-align:center;margin-bottom:.5rem;}
  .hub-sub{text-align:center;color:#777;margin-bottom:3rem;font-size:.95rem;}
  .hub-section-label{font-weight:800;font-size:.85rem;letter-spacing:1px;color:#999;text-transform:uppercase;margin-bottom:1rem;}
  .mode-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:1.2rem;margin-bottom:2.5rem;}
  .mode-card{background:#fff;border-radius:18px;padding:1.6rem;border:3px solid #E8E8E8;cursor:pointer;transition:all .2s;position:relative;}
  .mode-card:hover{border-color:#58CC02;transform:translateY(-3px);box-shadow:0 12px 30px rgba(88,204,2,.2);}
  .mode-card.selected{border-color:#58CC02;background:#F0FFF0;box-shadow:0 0 0 3px rgba(88,204,2,.2);}
  .mode-card-icon{font-size:2.2rem;margin-bottom:.8rem;}
  .mode-card h3{font-weight:800;font-size:1rem;margin-bottom:.4rem;color:#3C3C3C;}
  .mode-card p{font-size:.8rem;color:#888;line-height:1.5;}
  .mode-check{position:absolute;top:12px;right:12px;width:24px;height:24px;border-radius:50%;background:#58CC02;display:none;align-items:center;justify-content:center;color:#fff;font-size:.8rem;}
  .mode-card.selected .mode-check{display:flex;}
  .diff-cards{display:flex;gap:1rem;margin-bottom:3rem;}
  .diff-card{flex:1;background:#fff;border-radius:16px;padding:1.2rem;border:3px solid #E8E8E8;cursor:pointer;transition:all .2s;text-align:center;}
  .diff-card:hover{transform:translateY(-2px);}
  .diff-card.selected-easy{border-color:#58CC02;background:#F0FFF0;}
  .diff-card.selected-medium{border-color:#FFB020;background:#FFFBF0;}
  .diff-card.selected-hard{border-color:#FF4B4B;background:#FFF5F5;}
  .diff-card h3{font-weight:800;font-size:1rem;margin:.5rem 0 .3rem;}
  .diff-card p{font-size:.78rem;color:#888;}
  .hub-start-btn{width:100%;padding:16px;background:#58CC02;color:#fff;font-family:'Nunito',sans-serif;font-weight:800;font-size:1.15rem;border:none;border-radius:16px;cursor:pointer;border-bottom:4px solid #45A800;transition:all .2s;}
  .hub-start-btn:hover:not(:disabled){background:#50B800;transform:translateY(-2px);}
  .hub-start-btn:disabled{background:#ccc;border-bottom-color:#bbb;cursor:not-allowed;}
  .back-btn{display:inline-flex;align-items:center;gap:6px;background:none;border:none;font-family:'Nunito',sans-serif;font-weight:700;color:#888;cursor:pointer;font-size:.9rem;margin-bottom:1.5rem;padding:0;transition:color .2s;}
  .back-btn:hover{color:#58CC02;}

  /* GAME SCREEN */
  .game-screen{min-height:100vh;background:#FFF9F0;padding-top:0;}
  .game-header{background:#fff;border-bottom:2px solid #F0E0C0;padding:1rem 2rem;display:flex;align-items:center;gap:1rem;position:sticky;top:0;z-index:50;}
  .game-stat{display:flex;flex-direction:column;align-items:center;min-width:70px;}
  .game-stat-label{font-size:.7rem;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:.5px;}
  .game-stat-value{font-family:'Fredoka One',cursive;font-size:1.5rem;color:#3C3C3C;line-height:1;}
  .game-stat-value.green{color:#58CC02;}
  .game-stat-value.gold{color:#FFB020;}
  .game-stat-value.red{color:#FF4B4B;}
  .stat-sep{width:1px;background:#F0E0C0;align-self:stretch;}
  .game-progress{flex:1;height:10px;background:#F0E0C0;border-radius:5px;overflow:hidden;}
  .game-progress-fill{height:100%;background:#58CC02;transition:width .4s ease;border-radius:5px;}
  .game-mode-badge{font-size:.75rem;font-weight:800;padding:4px 10px;border-radius:8px;background:#E8F8E8;color:#45A800;}

  /* CLASSIC GAME */
  .classic-body{padding:2rem;max-width:1000px;margin:0 auto;}
  .classic-cols{display:grid;grid-template-columns:1fr 1fr;gap:1.5rem;}
  .col-label{font-size:.75rem;font-weight:800;letter-spacing:1px;color:#BBB;text-transform:uppercase;margin-bottom:.8rem;}
  .match-item{background:#fff;border-radius:14px;padding:1rem 1.2rem;border:2px solid #E8E8E8;cursor:pointer;transition:all .2s;margin-bottom:.7rem;font-weight:700;font-size:.92rem;line-height:1.4;display:flex;align-items:flex-start;gap:.6rem;}
  .match-item .item-emoji{font-size:1.2rem;flex-shrink:0;margin-top:.1rem;}
  .match-item:hover:not(.disabled){border-color:#58CC02;background:#FAFFF5;}
  .match-item.selected{border-color:#58CC02;background:#E8FFF0;box-shadow:0 0 0 3px rgba(88,204,2,.2);}
  .match-item.correct{border-color:#58CC02;background:#E8FFF0;opacity:.6;pointer-events:none;}
  .match-item.wrong-flash{animation:wrongShake .5s ease;}
  .match-item.disabled{opacity:.5;pointer-events:none;cursor:default;}
  .match-item.hint-selected{border-color:#FFB020;background:#FFFBF0;}
  @keyframes wrongShake{0%,100%{transform:translateX(0);}20%{transform:translateX(-6px);}40%{transform:translateX(6px);}60%{transform:translateX(-4px);}80%{transform:translateX(4px);}}
  @keyframes correctPop{0%{transform:scale(1);}50%{transform:scale(1.04);}100%{transform:scale(1);}}
  .correct-pop{animation:correctPop .3s ease;}

  /* MEMORY FLIP */
  .flip-body{padding:2rem;max-width:900px;margin:0 auto;}
  .flip-grid{display:grid;gap:12px;}
  .flip-grid-4{grid-template-columns:repeat(4,1fr);}
  .flip-grid-6{grid-template-columns:repeat(4,1fr);}
  .flip-grid-8{grid-template-columns:repeat(4,1fr);}
  .flip-card-outer{aspect-ratio:3/4;perspective:800px;cursor:pointer;}
  .flip-card-inner{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .5s cubic-bezier(.4,.2,.2,1);}
  .flip-card-outer.flipped .flip-card-inner,.flip-card-outer.matched .flip-card-inner{transform:rotateY(180deg);}
  .flip-card-front,.flip-card-back{position:absolute;inset:0;border-radius:16px;backface-visibility:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px;}
  .flip-card-front{background:linear-gradient(135deg,#4C6EF5,#7048E8);border:3px solid #3D5AF1;box-shadow:0 4px 12px rgba(70,100,245,.3);}
  .flip-card-front-pattern{font-size:2rem;opacity:.3;}
  .flip-card-back{transform:rotateY(180deg);border:3px solid #E8E8E8;background:#fff;overflow:hidden;padding:0;}
  .flip-card-outer.matched .flip-card-back{border-color:#58CC02;box-shadow:0 4px 16px rgba(88,204,2,.3);}
  .flip-name-card{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px;background:#fff;}
  .flip-image-card{width:100%;height:100%;position:relative;overflow:hidden;border-radius:13px;}
  .flip-image-card img{width:100%;height:100%;object-fit:cover;display:block;}
  .flip-image-card-fallback{width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:3rem;}

  /* POPUP */
  .overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:200;display:flex;align-items:center;justify-content:center;padding:1rem;animation:fadeIn .2s ease;}
  @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
  .popup{background:#fff;border-radius:24px;max-width:520px;width:100%;overflow:hidden;animation:slideUp .3s cubic-bezier(.34,1.56,.64,1);max-height:90vh;overflow-y:auto;}
  @keyframes slideUp{from{transform:translateY(40px) scale(.95);opacity:0;}to{transform:translateY(0) scale(1);opacity:1;}}
  .popup-header{padding:1.8rem 1.8rem 1rem;display:flex;align-items:flex-start;gap:1rem;}
  .popup-emoji-box{width:72px;height:72px;border-radius:18px;display:flex;align-items:center;justify-content:center;font-size:2.2rem;flex-shrink:0;}
  .popup-title{font-family:'Fredoka One',cursive;font-size:1.6rem;color:#3C3C3C;}
  .popup-origin{font-size:.82rem;color:#888;font-weight:600;margin-top:.2rem;}
  .popup-cat{display:inline-block;font-size:.72rem;font-weight:800;padding:3px 10px;border-radius:8px;background:#E8F8E8;color:#45A800;margin-top:.4rem;}
  .popup-body{padding:0 1.8rem 1.8rem;}
  .popup-img{width:100%;height:180px;object-fit:cover;border-radius:14px;margin-bottom:1rem;display:block;}
  .popup-img-fallback{width:100%;height:140px;border-radius:14px;margin-bottom:1rem;display:flex;align-items:center;justify-content:center;font-size:4rem;}
  .popup-detail{font-size:.9rem;color:#555;line-height:1.7;margin-bottom:1rem;padding:.9rem;background:#FAFAFA;border-radius:12px;}
  .popup-ling{background:#F8F0FF;border-radius:16px;padding:1rem 1.2rem;margin-bottom:1rem;}
  .popup-ling h4{font-weight:800;font-size:.8rem;color:#9B59B6;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.8rem;}
  .popup-ling-item{margin-bottom:.7rem;}
  .popup-ling-item:last-child{margin-bottom:0;}
  .popup-ling-label{font-size:.73rem;font-weight:800;color:#9B59B6;text-transform:uppercase;letter-spacing:.5px;}
  .popup-ling-text{font-size:.85rem;color:#555;line-height:1.6;margin-top:.2rem;}
  .popup-close-btn{width:100%;padding:14px;background:#58CC02;color:#fff;font-family:'Nunito',sans-serif;font-weight:800;font-size:1rem;border:none;border-radius:14px;cursor:pointer;border-bottom:3px solid #45A800;transition:all .2s;}
  .popup-close-btn:hover{background:#50B800;}
  .popup-score-badge{background:#FFB020;color:#fff;font-size:.75rem;font-weight:800;padding:3px 10px;border-radius:8px;display:inline-block;margin-top:.4rem;}

  /* STREAK FIRE */
  .streak-fire{font-size:1rem;animation:fireWiggle .4s ease infinite alternate;}
  @keyframes fireWiggle{from{transform:scale(1);}to{transform:scale(1.2);}}

  /* RESULT PAGE */
  .result-page{min-height:100vh;background:linear-gradient(135deg,#F0FFF0,#FFF9F0);display:flex;align-items:center;justify-content:center;padding:2rem;}
  .result-card{background:#fff;border-radius:28px;padding:3rem;max-width:500px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.1);}
  .result-trophy{font-size:5rem;margin-bottom:1rem;animation:trophy 1s cubic-bezier(.34,1.56,.64,1);}
  @keyframes trophy{from{transform:scale(0) rotate(-20deg);}to{transform:scale(1) rotate(0);}}
  .result-title{font-family:'Fredoka One',cursive;font-size:2rem;margin-bottom.5rem;}
  .result-score{font-family:'Fredoka One',cursive;font-size:4rem;color:#58CC02;margin:1rem 0;}
  .result-stats{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin:1.5rem 0;}
  .result-stat{background:#FAFAFA;border-radius:16px;padding:1rem;}
  .result-stat-val{font-family:'Fredoka One',cursive;font-size:1.8rem;color:#3C3C3C;}
  .result-stat-label{font-size:.75rem;font-weight:700;color:#999;text-transform:uppercase;letter-spacing:.5px;margin-top:.2rem;}
  .result-btns{display:grid;gap:.8rem;margin-top:1.5rem;}
  .result-btn-main{padding:14px;background:#58CC02;color:#fff;font-family:'Nunito',sans-serif;font-weight:800;font-size:1rem;border:none;border-radius:14px;cursor:pointer;border-bottom:3px solid #45A800;transition:all .2s;}
  .result-btn-main:hover{background:#50B800;transform:translateY(-1px);}
  .result-btn-sec{padding:14px;background:#fff;color:#777;font-family:'Nunito',sans-serif;font-weight:700;font-size:.95rem;border:2px solid #E8E8E8;border-radius:14px;cursor:pointer;transition:all .2s;}
  .result-btn-sec:hover{border-color:#ccc;color:#555;}

  /* ENCYCLOPEDIA */
  .enc{min-height:100vh;background:#FFF9F0;padding-top:80px;}
  .enc-header{background:#fff;border-bottom:2px solid #F0E0C0;padding:1.5rem 2rem;display:flex;align-items:center;gap:1rem;}
  .enc-title{font-family:'Fredoka One',cursive;font-size:1.8rem;color:#3C3C3C;}
  .enc-body{max-width:900px;margin:0 auto;padding:2rem;}
  .enc-search{width:100%;padding:12px 16px;border:2px solid #E8E8E8;border-radius:14px;font-family:'Nunito',sans-serif;font-size:1rem;outline:none;transition:border-color .2s;background:#fff;}
  .enc-search:focus{border-color:#58CC02;}
  .enc-filters{display:flex;gap:.6rem;flex-wrap:wrap;margin:1rem 0 2rem;}
  .enc-filter{padding:6px 14px;border-radius:20px;border:2px solid #E8E8E8;background:#fff;font-family:'Nunito',sans-serif;font-weight:700;font-size:.8rem;cursor:pointer;transition:all .2s;}
  .enc-filter:hover{border-color:#58CC02;}
  .enc-filter.active{background:#58CC02;border-color:#58CC02;color:#fff;}
  .enc-list{display:grid;gap:1.2rem;}
  .enc-card{background:#fff;border-radius:20px;overflow:hidden;border:2px solid #F0E0C0;transition:all .2s;cursor:pointer;}
  .enc-card:hover{border-color:#58CC02;box-shadow:0 8px 24px rgba(88,204,2,.15);transform:translateY(-2px);}
  .enc-card-header{padding:1.2rem 1.5rem;display:flex;align-items:center;gap:1rem;}
  .enc-card-emoji{width:60px;height:60px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.8rem;flex-shrink:0;}
  .enc-card-info h3{font-weight:800;font-size:1rem;color:#3C3C3C;}
  .enc-card-info .enc-origin{font-size:.8rem;color:#888;font-weight:600;margin-top:.2rem;}
  .enc-card-info .enc-cat{display:inline-block;font-size:.7rem;font-weight:800;padding:2px 8px;border-radius:6px;background:#E8F8E8;color:#45A800;margin-top:.4rem;}
  .enc-card-body{padding:0 1.5rem 1.5rem;display:none;}
  .enc-card.expanded .enc-card-body{display:block;}
  .enc-img{width:100%;height:200px;object-fit:cover;border-radius:14px;margin-bottom:1rem;display:block;}
  .enc-img-fallback{width:100%;height:160px;border-radius:14px;margin-bottom:1rem;display:flex;align-items:center;justify-content:center;font-size:4rem;}
  .enc-card-sentence{margin-bottom:.8rem;padding:.8rem;background:#FFF9F0;border-radius:10px;font-size:.85rem;color:#666;line-height:1.6;font-style:italic;}
  .enc-card-detail{font-size:.88rem;color:#555;line-height:1.7;margin-bottom:1rem;padding:.8rem;background:#FAFAFA;border-radius:10px;}
  .enc-ling{background:#F8F0FF;border-radius:12px;padding:1rem;}
  .enc-ling h4{font-size:.72rem;font-weight:800;color:#9B59B6;text-transform:uppercase;letter-spacing:.5px;margin-bottom:.8rem;}
  .enc-ling-item{margin-bottom:.6rem;}
  .enc-ling-item:last-child{margin-bottom:0;}
  .enc-ling-label{font-size:.7rem;font-weight:800;color:#9B59B6;text-transform:uppercase;}
  .enc-ling-text{font-size:.83rem;color:#555;line-height:1.5;margin-top:.2rem;}

  /* TIMER */
  .timer-bar{height:8px;border-radius:4px;overflow:hidden;background:#F0E0C0;flex:1;}
  .timer-fill{height:100%;border-radius:4px;transition:width 1s linear;}
  .timer-crit{animation:timerPulse .5s ease infinite alternate;}
  @keyframes timerPulse{from{opacity:1;}to{opacity:.6;}}

  /* LANG TOGGLE */
  .lang-toggle{background:#F0E0C0;border:none;border-radius:20px;padding:4px 12px;font-family:'Nunito',sans-serif;font-weight:800;font-size:.8rem;cursor:pointer;transition:all .2s;color:#888;}
  .lang-toggle:hover{background:#E0D0B0;}

  /* RESPONSIVE */
  @media(max-width:768px){
    .hero-title{font-size:2.5rem;}
    .about-grid{grid-template-columns:1fr;}
    .modes-grid{grid-template-columns:1fr;}
    .team-grid{grid-template-columns:1fr 1fr;}
    .mode-cards{grid-template-columns:1fr;}
    .classic-cols{grid-template-columns:1fr;}
    .flip-grid-4,.flip-grid-6,.flip-grid-8{grid-template-columns:repeat(4,1fr);}
    .nav-links{gap:.8rem;}
    .float-cards{display:none;}
    .result-stats{grid-template-columns:1fr;}
  }

  /* FOOTER */
  footer{background:#3C3C3C;color:#ccc;text-align:center;padding:2rem;font-size:.85rem;}
  footer strong{color:#58CC02;font-family:'Fredoka One',cursive;font-size:1rem;}

  /* CORRECT/WRONG FLASHES */
  @keyframes correctFlash{0%{background:#E8FFF0;}50%{background:#C8FFD0;}100%{background:#E8FFF0;}}
  .correct-flash{animation:correctFlash .4s ease;}
  .wrong-bg{background:#FFF0F0 !important;border-color:#FF4B4B !important;}
  .timer-warn{color:#FFB020;}
  .timer-danger{color:#FF4B4B;}
`;

/* ═══════════════════════════════════════════════════════════
   POPUP INSIGHT
═══════════════════════════════════════════════════════════ */
function PopupInsight({ item, points, streak, images, onClose }) {
  if (!item) return null;
  const streakLabel = streak > 1 ? `🔥 ${streak}x Streak!` : null;
  const imgSrc = images?.[item.id];
  return (
    <div className="overlay" onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div className="popup" onClick={e=>e.stopPropagation()}>
        <div className="popup-header">
          <div className="popup-emoji-box" style={{background:item.bg}}>{item.emoji}</div>
          <div>
            <div className="popup-title">{item.name}</div>
            <div className="popup-origin">📍 {item.origin}</div>
            <div className="popup-cat">{item.category}</div>
            {points && <div style={{marginTop:'.4rem',display:'flex',gap:'.4rem',flexWrap:'wrap'}}>
              <div className="popup-score-badge">+{points} pts</div>
              {streakLabel && <div className="popup-score-badge" style={{background:'#FF9600'}}>{streakLabel}</div>}
            </div>}
          </div>
        </div>
        <div className="popup-body">
          {imgSrc
            ? <img src={imgSrc} alt={item.name} className="popup-img" onError={e=>{e.target.style.display='none';}} />
            : <div className="popup-img-fallback" style={{background:item.bg+'33'}}>{item.emoji}</div>
          }
          <div className="popup-detail">{item.detail}</div>
          <div className="popup-ling">
            <h4>🔍 Linguistic Analysis</h4>
            <div className="popup-ling-item">
              <div className="popup-ling-label">Symbolism</div>
              <div className="popup-ling-text">{item.symbolism}</div>
            </div>
            <div className="popup-ling-item">
              <div className="popup-ling-label">Metaphor</div>
              <div className="popup-ling-text">{item.metaphor}</div>
            </div>
            <div className="popup-ling-item">
              <div className="popup-ling-label">Translation</div>
              <div className="popup-ling-text">{item.translation}</div>
            </div>
          </div>
          <button className="popup-close-btn" onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   GAME HEADER
═══════════════════════════════════════════════════════════ */
function GameHeader({ score, streak, matchedCount, totalCount, timeLeft, maxTime, modeLabel, diffLabel, onBack }) {
  const pct = (matchedCount / totalCount) * 100;
  const timePct = maxTime ? (timeLeft / maxTime) * 100 : null;
  const timerColor = timeLeft <= 20 ? '#FF4B4B' : timeLeft <= 45 ? '#FFB020' : '#58CC02';
  return (
    <div className="game-header">
      <button className="back-btn" onClick={onBack} style={{marginBottom:0}}>← Exit</button>
      <div className="stat-sep" />
      <div className="game-stat">
        <div className="game-stat-label">Score</div>
        <div className="game-stat-value green">{score}</div>
      </div>
      <div className="stat-sep" />
      <div className="game-stat">
        <div className="game-stat-label">Streak {streak>=3?'🔥':''}</div>
        <div className="game-stat-value gold">{streak}</div>
      </div>
      {maxTime && <>
        <div className="stat-sep" />
        <div className="game-stat">
          <div className="game-stat-label">Time</div>
          <div className="game-stat-value" style={{color:timerColor,fontFamily:"'Fredoka One',cursive",fontSize:'1.5rem'}}>
            {timeLeft}s
          </div>
        </div>
      </>}
      <div className="stat-sep" />
      <div style={{flex:1}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'4px'}}>
          <span style={{fontSize:'.72rem',fontWeight:700,color:'#BBB'}}>{matchedCount}/{totalCount} matched</span>
          <span className="game-mode-badge">{modeLabel} · {diffLabel}</span>
        </div>
        <div className="game-progress"><div className="game-progress-fill" style={{width:`${pct}%`}} /></div>
        {maxTime && <div className="timer-bar" style={{marginTop:'4px'}}>
          <div className="timer-fill" style={{width:`${timePct}%`,background:timerColor}} />
        </div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CLASSIC GAME (Classic Match + Time Attack)
═══════════════════════════════════════════════════════════ */
function ClassicGame({ mode, difficulty, items, images, onComplete, onBack }) {
  const cfg = DIFF[difficulty];
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(cfg.time);
  const [matched, setMatched] = useState([]);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [flashIds, setFlashIds] = useState({});
  const [popup, setPopup] = useState(null);
  const [pendingPoints, setPendingPoints] = useState(0);
  const [pendingStreak, setPendingStreak] = useState(0);
  const rightItems = useRef(shuffle(items)).current;
  const timerRef = useRef();
  const pendingComplete = useRef(false);

  useEffect(() => {
    if (mode !== 'timeAttack') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (mode === 'timeAttack' && timeLeft === 0 && !popup) {
      onComplete(score, maxStreak, 'timeout');
    }
  }, [timeLeft, popup]);

  const handleLeft = (item) => {
    if (matched.includes(item.id) || popup) return;
    setSelectedLeft(prev => prev?.id === item.id ? null : item);
  };

  const handleRight = (item) => {
    if (matched.includes(item.id) || popup) return;
    if (!selectedLeft) return;
    const isMatch = selectedLeft.id === item.id;
    if (isMatch) {
      const newStreak = streak + 1;
      const pts = cfg.base * newStreak;
      const newScore = score + pts;
      const newMax = Math.max(maxStreak, newStreak);
      setScore(newScore);
      setStreak(newStreak);
      setMaxStreak(newMax);
      const newMatched = [...matched, item.id];
      setMatched(newMatched);
      setFlashIds(f => ({...f, [item.id]:'correct'}));
      setTimeout(() => setFlashIds(f => {const n={...f};delete n[item.id];return n;}), 600);
      setSelectedLeft(null);
      setPendingPoints(pts);
      setPendingStreak(newStreak);
      setPopup(item);
      if (newMatched.length === items.length) pendingComplete.current = true;
    } else {
      setStreak(0);
      setFlashIds(f => ({...f, [selectedLeft.id]:'wrong', [item.id]:'wrong'}));
      setTimeout(() => setFlashIds(f => {const n={...f};delete n[selectedLeft.id];delete n[item.id];return n;}), 700);
      setSelectedLeft(null);
    }
  };

  const handlePopupClose = () => {
    setPopup(null);
    if (pendingComplete.current) { onComplete(score + pendingPoints, Math.max(maxStreak, pendingStreak)); }
  };

  const getLeftClass = (item) => {
    let c = 'match-item';
    if (matched.includes(item.id)) return c + ' correct';
    if (selectedLeft?.id === item.id) c += ' selected';
    if (flashIds[item.id] === 'wrong') c += ' wrong-flash wrong-bg';
    return c;
  };
  const getRightClass = (item) => {
    let c = 'match-item';
    if (matched.includes(item.id)) return c + ' correct';
    if (flashIds[item.id] === 'wrong') c += ' wrong-flash wrong-bg';
    if (flashIds[item.id] === 'correct') c += ' correct-flash';
    return c;
  };

  return (
    <div className="game-screen">
      <GameHeader score={score} streak={streak} matchedCount={matched.length} totalCount={items.length}
        timeLeft={timeLeft} maxTime={mode==='timeAttack'?cfg.time:null}
        modeLabel={mode==='timeAttack'?'Time Attack':'Classic'} diffLabel={cfg.label} onBack={onBack} />
      <div className="classic-body">
        {selectedLeft && <div style={{textAlign:'center',marginBottom:'1rem',fontSize:'.88rem',color:'#58CC02',fontWeight:700}}>
          ✓ "{selectedLeft.name}" selected — now pick the matching description!
        </div>}
        {!selectedLeft && matched.length < items.length && <div style={{textAlign:'center',marginBottom:'1rem',fontSize:'.88rem',color:'#AAA',fontWeight:700}}>
          Click a name on the left to start matching ↓
        </div>}
        <div className="classic-cols">
          <div>
            <div className="col-label">Cultural Names</div>
            {items.map(item => (
              <div key={item.id} className={getLeftClass(item)} onClick={() => handleLeft(item)}>
                <span className="item-emoji">{item.emoji}</span>
                <span>{item.name}</span>
                {matched.includes(item.id) && <span style={{marginLeft:'auto',color:'#58CC02'}}>✓</span>}
              </div>
            ))}
          </div>
          <div>
            <div className="col-label">Descriptions</div>
            {rightItems.map(item => (
              <div key={item.id} className={getRightClass(item)} onClick={() => handleRight(item)}>
                <span style={{fontSize:'.88rem',lineHeight:1.5}}>{item.card}</span>
                {matched.includes(item.id) && <span style={{marginLeft:'auto',flexShrink:0,color:'#58CC02'}}>✓</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
      {popup && <PopupInsight item={popup} points={pendingPoints} streak={pendingStreak} images={images} onClose={handlePopupClose} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MEMORY FLIP GAME
═══════════════════════════════════════════════════════════ */
function MemoryFlipGame({ difficulty, items, images, onComplete, onBack }) {
  const cfg = DIFF[difficulty];
  const [cards, setCards] = useState(() => {
    const pairs = items.flatMap(item => [
      { uid:`${item.id}-n`, id:item.id, type:'name', item },
      { uid:`${item.id}-i`, id:item.id, type:'image', item }
    ]);
    return shuffle(pairs).map(c => ({...c, flipped:false, matched:false}));
  });
  const [selected, setSelected] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [popup, setPopup] = useState(null);
  const [pendingPoints, setPendingPoints] = useState(0);
  const [pendingStreak, setPendingStreak] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const pendingComplete = useRef(false);

  const matched = cards.filter(c => c.matched).length / 2;

  const handleFlip = (idx) => {
    if (isLocked || cards[idx].flipped || cards[idx].matched || popup) return;
    if (selected.length === 1 && selected[0] === idx) return;

    const newCards = cards.map((c,i) => i===idx ? {...c, flipped:true} : c);
    setCards(newCards);

    if (selected.length === 0) {
      setSelected([idx]);
    } else {
      const [aIdx] = selected;
      setSelected([]);
      setIsLocked(true);
      const cardA = newCards[aIdx];
      const cardB = newCards[idx];
      if (cardA.id === cardB.id && cardA.type !== cardB.type) {
        const newStreak = streak + 1;
        const pts = cfg.base * newStreak;
        setScore(s => s + pts);
        setStreak(newStreak);
        setMaxStreak(m => Math.max(m, newStreak));
        setPendingPoints(pts);
        setPendingStreak(newStreak);
        setTimeout(() => {
          setCards(c => c.map((card, i) => i===aIdx||i===idx ? {...card, matched:true} : card));
          setIsLocked(false);
          setPopup(cardB.item);
          const newMatchCount = (matched + 1);
          if (newMatchCount === items.length) pendingComplete.current = true;
        }, 500);
      } else {
        setStreak(0);
        setTimeout(() => {
          setCards(c => c.map((card, i) => i===aIdx||i===idx ? {...card, flipped:false} : card));
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const handlePopupClose = () => {
    const pts = pendingPoints, st = pendingStreak;
    setPopup(null);
    if (pendingComplete.current) {
      onComplete(score + pts, Math.max(maxStreak, st));
    }
  };

  const cols = 4;
  const imgSrc = (item) => images?.[item.id] || null;

  return (
    <div className="game-screen">
      <GameHeader score={score} streak={streak} matchedCount={matched} totalCount={items.length}
        modeLabel="Memory Flip" diffLabel={cfg.label} onBack={onBack} />
      <div className="flip-body">
        <div style={{display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gap:'10px'}}>
          {cards.map((card, idx) => (
            <div key={card.uid} className={`flip-card-outer ${card.flipped||card.matched?'flipped':''} ${card.matched?'matched':''}`}
              onClick={() => handleFlip(idx)}>
              <div className="flip-card-inner">
                <div className="flip-card-front">
                  <div className="flip-card-front-pattern">🌀</div>
                  <div style={{fontSize:'.6rem',fontWeight:800,color:'rgba(255,255,255,.5)',marginTop:'4px',textTransform:'uppercase',letterSpacing:'1px'}}>Flip!</div>
                </div>
                <div className="flip-card-back" style={card.matched ? {borderColor:'#58CC02'} : {}}>
                  {card.type === 'image' ? (
                    /* IMAGE-ONLY CARD — no text at all */
                    <div className="flip-image-card">
                      {imgSrc(card.item)
                        ? <img src={imgSrc(card.item)} alt={card.item.name}
                            style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}
                            onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='flex';}} />
                        : null
                      }
                      <div style={{
                        width:'100%',height:'100%',display: imgSrc(card.item) ? 'none' : 'flex',
                        alignItems:'center',justifyContent:'center',
                        background:card.item.bg, fontSize:'3.5rem', borderRadius:'13px'
                      }}>{card.item.emoji}</div>
                    </div>
                  ) : (
                    /* NAME-ONLY CARD — just the cultural name, centered */
                    <div className="flip-name-card">
                      <div style={{
                        fontSize: card.item.name.length > 12 ? '.82rem' : '.95rem',
                        fontWeight:800, textAlign:'center', color:'#3C3C3C',
                        lineHeight:1.3, padding:'0 8px'
                      }}>{card.item.name}</div>
                      {card.matched && <div style={{fontSize:'.75rem',marginTop:'8px',color:'#58CC02',fontWeight:800}}>✓</div>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {popup && <PopupInsight item={popup} points={pendingPoints} streak={pendingStreak} images={images} onClose={handlePopupClose} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   RESULT PAGE
═══════════════════════════════════════════════════════════ */
function ResultPage({ score, maxStreak, mode, difficulty, itemCount, onReplay, onMenu, onEnc }) {
  const cfg = DIFF[difficulty];
  const maxPossible = cfg.base * itemCount * itemCount;
  const pct = Math.round((score / maxPossible) * 100);
  const trophy = pct >= 80 ? '🏆' : pct >= 50 ? '🥈' : '🥉';
  const msg = pct >= 80 ? "Outstanding! You're a true East Java expert!" : pct >= 50 ? "Great job! You know your Javanese culture!" : "Nice effort! Keep exploring East Java's heritage!";
  const modeNames = { classic:'Classic Match', timeAttack:'Time Attack', memoryFlip:'Memory Flip' };
  return (
    <div className="result-page">
      <div className="result-card">
        <div className="result-trophy">{trophy}</div>
        <div className="result-title" style={{fontFamily:"'Fredoka One',cursive"}}>{msg}</div>
        <div className="result-score">{score}</div>
        <div style={{fontSize:'.85rem',color:'#BBB',fontWeight:700,marginTop:'-8px',marginBottom:'1rem'}}>TOTAL SCORE</div>
        <div className="result-stats">
          <div className="result-stat">
            <div className="result-stat-val">🔥{maxStreak}</div>
            <div className="result-stat-label">Max Streak</div>
          </div>
          <div className="result-stat">
            <div className="result-stat-val">{pct}%</div>
            <div className="result-stat-label">Efficiency</div>
          </div>
          <div className="result-stat">
            <div className="result-stat-val">{itemCount}</div>
            <div className="result-stat-label">Pairs Matched</div>
          </div>
          <div className="result-stat">
            <div className="result-stat-val" style={{fontSize:'1rem',paddingTop:'.3rem'}}>{modeNames[mode]}</div>
            <div className="result-stat-label">Mode · {cfg.label}</div>
          </div>
        </div>
        <div className="result-btns">
          <button className="result-btn-main" onClick={onReplay}>Play Again</button>
          <button className="result-btn-sec" onClick={onEnc}>Browse Encyclopedia</button>
          <button className="result-btn-sec" onClick={onMenu}>Main Menu</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   ENCYCLOPEDIA
═══════════════════════════════════════════════════════════ */
function Encyclopedia({ images, onBack }) {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [expanded, setExpanded] = useState(null);
  const cats = ['All', ...new Set(CULTURE_DB.map(c => c.category.split('/')[0].trim()))];
  const filtered = CULTURE_DB.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.origin.toLowerCase().includes(search.toLowerCase()) ||
      c.card.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || c.category.includes(catFilter);
    return matchSearch && matchCat;
  });
  return (
    <div className="enc">
      <div style={{background:'#fff',borderBottom:'2px solid #F0E0C0',padding:'1rem 2rem',display:'flex',alignItems:'center',gap:'1rem',position:'sticky',top:0,zIndex:50}}>
        <button className="back-btn" onClick={onBack} style={{marginBottom:0}}>← Back</button>
        <span style={{fontFamily:"'Fredoka One',cursive",fontSize:'1.5rem',color:'#3C3C3C'}}>📖 Cultural Encyclopedia</span>
        <span style={{marginLeft:'auto',fontSize:'.82rem',color:'#BBB',fontWeight:700}}>{CULTURE_DB.length} items</span>
      </div>
      <div className="enc-body">
        <input className="enc-search" placeholder="Search by name, origin, or keyword…" value={search} onChange={e=>setSearch(e.target.value)} />
        <div className="enc-filters">
          {cats.map(cat => <button key={cat} className={`enc-filter ${catFilter===cat?'active':''}`} onClick={()=>setCatFilter(cat)}>{cat}</button>)}
        </div>
        <div className="enc-list">
          {filtered.length === 0 && <div style={{textAlign:'center',color:'#BBB',padding:'3rem',fontWeight:700}}>No results found.</div>}
          {filtered.map(item => {
            const imgSrc = images?.[item.id];
            return (
              <div key={item.id} className={`enc-card ${expanded===item.id?'expanded':''}`} onClick={()=>setExpanded(expanded===item.id?null:item.id)}>
                <div className="enc-card-header">
                  <div className="enc-card-emoji" style={{background:item.bg}}>{item.emoji}</div>
                  <div className="enc-card-info">
                    <h3>{item.name}</h3>
                    <div className="enc-origin">📍 {item.origin}</div>
                    <div className="enc-cat">{item.category}</div>
                  </div>
                  <div style={{marginLeft:'auto',color:'#BBB',fontSize:'1.2rem',flexShrink:0}}>{expanded===item.id?'▲':'▼'}</div>
                </div>
                {expanded===item.id && (
                  <div className="enc-card-body" style={{display:'block'}}>
                    {/* ORDER: Image → Card Sentence → Detail → Linguistic Analysis */}
                    {imgSrc
                      ? <img src={imgSrc} alt={item.name} className="enc-img"
                          onError={e=>{e.target.style.display='none';e.target.nextSibling.style.display='flex';}} />
                      : null
                    }
                    <div className="enc-img-fallback" style={{
                      background: item.bg+'33',
                      display: imgSrc ? 'none' : 'flex'
                    }}>{item.emoji}</div>
                    <div className="enc-card-sentence">"{item.card}"</div>
                    <div className="enc-card-detail">{item.detail}</div>
                    <div className="enc-ling">
                      <h4>🔍 Linguistic Analysis</h4>
                      <div className="enc-ling-item"><div className="enc-ling-label">Symbolism</div><div className="enc-ling-text">{item.symbolism}</div></div>
                      <div className="enc-ling-item"><div className="enc-ling-label">Metaphor</div><div className="enc-ling-text">{item.metaphor}</div></div>
                      <div className="enc-ling-item"><div className="enc-ling-label">Translation</div><div className="enc-ling-text">{item.translation}</div></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   GAME HUB
═══════════════════════════════════════════════════════════ */
function GameHub({ onStart, onBack }) {
  const [mode, setMode] = useState(null);
  const [diff, setDiff] = useState(null);
  const modes = [
    { key:'classic', icon:'🃏', name:'Classic Match', desc:'Match cultural names to their descriptions at your own pace. Perfect for first-timers.', tag:'Relaxed', tagColor:'#58CC02' },
    { key:'timeAttack', icon:'⏱️', name:'Time Attack', desc:'Same matching mechanic, but the clock is ticking! How fast can you go?', tag:'Fast-Paced', tagColor:'#FFB020' },
    { key:'memoryFlip', icon:'🔁', name:'Memory Flip', desc:'Flip hidden cards and find matching pairs. Put your visual memory to the test!', tag:'Memory', tagColor:'#1CB0F6' }
  ];
  return (
    <div className="hub">
      <div className="hub-inner">
        <button className="back-btn" onClick={onBack}>← Back to Home</button>
        <div className="hub-title">Pick Your Game Mode</div>
        <div className="hub-sub">Choose how you want to explore East Java's cultural heritage.</div>
        <div className="hub-section-label">Game Mode</div>
        <div className="mode-cards">
          {modes.map(m => (
            <div key={m.key} className={`mode-card ${mode===m.key?'selected':''}`} onClick={()=>setMode(m.key)}>
              <div className="mode-check">✓</div>
              <div className="mode-card-icon">{m.icon}</div>
              <h3>{m.name}</h3>
              <p>{m.desc}</p>
              <span className="mode-tag" style={{background:m.tagColor}}>{m.tag}</span>
            </div>
          ))}
        </div>
        <div className="hub-section-label">Difficulty</div>
        <div className="diff-cards">
          {Object.entries(DIFF).map(([key,cfg]) => (
            <div key={key} className={`diff-card ${diff===key?`selected-${key}`:''}`} onClick={()=>setDiff(key)}
              style={{borderColor: diff===key ? cfg.color : undefined}}>
              <div style={{fontSize:'1.8rem'}}>{cfg.dot}</div>
              <h3 style={{color: diff===key ? cfg.color : '#3C3C3C'}}>{cfg.label}</h3>
              <p>{cfg.pairs} pairs · {cfg.base}pts/match</p>
              {key==='timeAttack' && <p style={{color:'#BBB',fontSize:'.72rem'}}>{cfg.time}s limit</p>}
            </div>
          ))}
        </div>
        <button className="hub-start-btn" disabled={!mode||!diff}
          onClick={() => { const selected = shuffle(CULTURE_DB).slice(0, DIFF[diff].pairs); onStart(mode, diff, selected); }}>
          {mode && diff ? `Start ${modes.find(m=>m.key===mode)?.name} — ${DIFF[diff].label} →` : 'Select a mode and difficulty to start'}
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   LANDING PAGE
═══════════════════════════════════════════════════════════ */
function LandingPage({ onPlay, onEnc }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({behavior:'smooth'});
  return (
    <div>
      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo">🌺 Lingo<span>Cultura</span></div>
        <div className="nav-links">
          <span className="nav-link" onClick={()=>scrollTo('home')}>Home</span>
          <span className="nav-link" onClick={()=>scrollTo('about')}>About</span>
          <span className="nav-link" onClick={()=>scrollTo('modes')}>Modes</span>
          <span className="nav-link" onClick={()=>scrollTo('team')}>Team</span>
          <span className="nav-link" onClick={onEnc}>Encyclopedia</span>
          <button className="nav-btn" onClick={onPlay}>Play Now</button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-bg" />
        <div className="hero-pattern" />
        <div className="float-cards">
          <div className="float-card fc1"><span>🦁</span><div><div className="fc-label">Ponorogo</div><div className="fc-name">Reog Ponorogo</div></div></div>
          <div className="float-card fc2"><span>🎭</span><div><div className="fc-label">Malang</div><div className="fc-name">Topeng Malangan</div></div></div>
          <div className="float-card fc3"><span>🍲</span><div><div className="fc-label">East Java</div><div className="fc-name">Rawon</div></div></div>
          <div className="float-card fc4"><span>🐴</span><div><div className="fc-label">Kediri</div><div className="fc-name">Jaranan</div></div></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">🌺 20 Cultural Items from East Java</div>
          <h1 className="hero-title">
            <span className="line1">Discover East Java</span>
            <span className="line2">Through Play</span>
          </h1>
          <p className="hero-sub">
            Match cards, flip memories, and race the clock — all while uncovering the living heritage, language, and meaning behind East Java's most iconic traditions.
          </p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={onPlay}>Start Playing</button>
            <button className="btn-secondary" onClick={onEnc}>Browse Encyclopedia</button>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="section" id="about">
        <div className="section-inner">
          <div className="about-grid">
            <div>
              <div className="section-label">What is Lingo Cultura?</div>
              <h2 className="section-title">Culture Meets Language, Learning Meets Fun</h2>
              <p className="section-sub">Lingo Cultura turns passive scrolling into active discovery. We blend gamification with academic linguistics — so you're not just memorizing names, you're understanding what they really mean.</p>
              <div className="about-features">
                {[
                  {icon:'🧩',bg:'#E8F8E8',title:'3 Game Modes',desc:'Classic Match, Time Attack, and Memory Flip — each testing a different cognitive skill.'},
                  {icon:'📚',bg:'#F0F0FF',title:'Linguistic Depth',desc:'Every correct match unlocks a pop-up with symbolism, metaphor, and etymology analysis.'},
                  {icon:'🌍',bg:'#FFF8E8',title:'Bilingual Access',desc:'Built for both Indonesian students and international audiences curious about Javanese culture.'}
                ].map(f => (
                  <div key={f.title} className="feature-card">
                    <div className="feature-icon" style={{background:f.bg}}>{f.icon}</div>
                    <div className="feature-text"><h4>{f.title}</h4><p>{f.desc}</p></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="about-visual">
              <div className="about-stat"><h3>20</h3><p>Cultural Items from East Java</p></div>
              <div className="about-stat"><h3>3</h3><p>Unique Game Modes</p></div>
              <div className="about-stat"><h3>3</h3><p>Difficulty Levels</p></div>
              <div style={{marginTop:'1.5rem',fontSize:'.9rem',opacity:.8,lineHeight:1.7,position:'relative'}}>
                From ritual ceremonies and performing arts to gastronomy and traditional sports — every card tells a story worth knowing.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GAME MODES */}
      <section className="section section-alt" id="modes">
        <div className="section-inner">
          <div style={{textAlign:'center',marginBottom:'1rem'}}>
            <div className="section-label">How to Play</div>
            <h2 className="section-title">Three Ways to Explore</h2>
          </div>
          <div className="modes-grid">
            {[
              {icon:'🃏',name:'Classic Match',desc:'Two columns — cultural names on the left, descriptions on the right. Click a name, then click its matching description. No rush, just pure comprehension.',tag:'Beginner-Friendly',color:'#58CC02'},
              {icon:'⏱️',name:'Time Attack',desc:"Same matching mechanic as Classic, but you're racing a countdown timer. Every second counts — can you match them all before the clock hits zero?",tag:'High Pressure',color:'#FFB020'},
              {icon:'🔁',name:'Memory Flip',desc:"All cards are face-down. Flip two at a time to find matching pairs — an image card and its name card. Wrong guess? They flip back. Right? They stay revealed!",tag:'Test Your Memory',color:'#1CB0F6'}
            ].map(m => (
              <div key={m.name} className="mode-preview" onClick={onPlay}>
                <span className="mode-icon">{m.icon}</span>
                <h3>{m.name}</h3>
                <p>{m.desc}</p>
                <span className="mode-tag" style={{background:m.color}}>{m.tag}</span>
              </div>
            ))}
          </div>
          <div style={{textAlign:'center',marginTop:'3rem'}}>
            <button className="btn-primary" onClick={onPlay}>Choose Your Mode</button>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="section" id="team">
        <div className="section-inner">
          <div style={{textAlign:'center',marginBottom:'1rem'}}>
            <div className="section-label">The People Behind It</div>
            <h2 className="section-title">Meet the Team</h2>
          </div>
          <div className="team-grid">
            {[
              {name:'Nareswari Maia H.',  role:'UI/UX Designer & Web Developer', color:'58CC02', bg:'F0FFF0'},
              {name:'Yusnina Afifah',     role:'Cultural Researcher',             color:'1CB0F6', bg:'E8F8FF'},
              {name:'Anindya R. D.',      role:'Cultural Researcher',             color:'FF9600', bg:'FFF5E0'},
              {name:'Rosita Choirin',     role:'Linguistics Specialist',          color:'FF4B4B', bg:'FFF0F0'},
              {name:'Ihsan Pria D.',      role:'Linguistics Specialist',          color:'9B59B6', bg:'F5EEFF'},
            ].map(t => (
              <div key={t.name} className="team-card">
                <img
                  className="team-avatar"
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=${t.bg.replace('#','')}&color=${t.color}&size=176&font-size=0.38&bold=true&rounded=true`}
                  alt={t.name}
                  style={{border:`3px solid #${t.color}55`}}
                />
                <div className="team-name">{t.name}</div>
                <div className="team-role">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <p><strong>🌺 LingoCultura</strong> — Preserving East Java's heritage, one card at a time.</p>
        <p style={{marginTop:'.5rem',fontSize:'.8rem',opacity:.6}}>A web-based cultural gamification project · All cultural data sourced from East Java traditions</p>
      </footer>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════ */
export default function App() {
  const [page, setPage] = useState('landing');
  const [gameMode, setGameMode] = useState(null);
  const [gameDiff, setGameDiff] = useState(null);
  const [gameItems, setGameItems] = useState([]);
  const [finalScore, setFinalScore] = useState(0);
  const [finalMax, setFinalMax] = useState(0);
  const [images, setImages] = useState({});

  // Inject styles
  useEffect(() => {
    const el = document.createElement('style');
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  // Fetch Wikipedia images for all cultural items
  useEffect(() => {
    CULTURE_DB.forEach(item => fetchWikiImage(item, setImages));
  }, []);

  const startGame = (mode, diff, items) => {
    setGameMode(mode); setGameDiff(diff); setGameItems(items);
    setPage('game');
  };

  const handleComplete = (score, maxStreak) => {
    setFinalScore(score); setFinalMax(maxStreak);
    setPage('result');
  };

  const replayGame = () => {
    const items = shuffle(CULTURE_DB).slice(0, DIFF[gameDiff].pairs);
    setGameItems(items);
    setPage('game');
  };

  if (page === 'landing') return <LandingPage onPlay={()=>setPage('hub')} onEnc={()=>setPage('encyclopedia')} />;
  if (page === 'hub') return <GameHub onStart={startGame} onBack={()=>setPage('landing')} />;
  if (page === 'encyclopedia') return <Encyclopedia images={images} onBack={()=>setPage('landing')} />;
  if (page === 'result') return <ResultPage score={finalScore} maxStreak={finalMax} mode={gameMode} difficulty={gameDiff}
    itemCount={gameItems.length} onReplay={replayGame} onMenu={()=>setPage('landing')} onEnc={()=>setPage('encyclopedia')} />;
  if (page === 'game') {
    if (gameMode === 'memoryFlip') return <MemoryFlipGame difficulty={gameDiff} items={gameItems} images={images}
      onComplete={handleComplete} onBack={()=>setPage('hub')} />;
    return <ClassicGame mode={gameMode} difficulty={gameDiff} items={gameItems} images={images}
      onComplete={handleComplete} onBack={()=>setPage('hub')} />;
  }
  return null;
}
