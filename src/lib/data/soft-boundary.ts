export type ExhibitionLanguage = "en" | "ja";

export interface SoftBoundaryCopy {
  title: string;
  subtitle: string;
  eyebrow: string;
  summary: string;
  dates: string;
  hours: string;
  finalDayHours: string;
  venue: string;
  address: string;
  labels: {
    about: string;
    exhibitionViews: string;
    galleryPage: string;
    inquiry: string;
    dates: string;
    hours: string;
    venue: string;
    language: string;
    nextWork: string;
  };
  statement: string[];
  flyer: {
    title: string;
    description: string;
    previewAlt: string;
  };
  inquiry: string;
  imageAlt: string;
  imageAlts: string[];
}

export const softBoundarySourceUrl =
  "https://galleryandlinks81.jp/exhibition-2026/yilun-zhansolo-exhibition/";
export const softBoundaryInquiryUrl = "https://galleryandlinks81.jp/contact/";

export const softBoundaryAnnouncement = {
  en: "Soft Boundary",
  ja: "やわらかな境界",
  dates: "15–19 Sep 2026",
  venue: "GALLERY AND LINKS 81 · Tokyo",
  city: "Tokyo",
};

export const softBoundary: Record<ExhibitionLanguage, SoftBoundaryCopy> = {
  en: {
    title: "Soft Boundary",
    subtitle: "やわらかな境界",
    eyebrow: "Yilun Zhan solo exhibition",
    summary: "Light art and installation at GALLERY AND LINKS 81, Tokyo.",
    dates: "15 to 19 September 2026 (Tuesday to Saturday)",
    hours: "12:00 to 18:00",
    finalDayHours: "19 September: 12:00 to 16:00",
    venue: "GALLERY AND LINKS 81, main gallery, 2F",
    address: "Charles Ginza Building, 2-14-1 Ginza, Chuo-ku, Tokyo",
    labels: {
      about: "About the exhibition",
      exhibitionViews: "Exhibition views",
      galleryPage: "View the gallery listing",
      inquiry: "Contact the gallery",
      dates: "Dates",
      hours: "Opening hours",
      venue: "Venue",
      language: "Project language",
      nextWork: "Next work",
    },
    statement: [
      "How does light give form to what was previously unseen?",
      "Emotions and memories have no physical substance. Neither do the relationships that arise between people and spaces. Light brings these formless things into perception for a moment, as if giving them a fleeting outline without fixing their form.",
      "That outline is unstable. It changes continually with movement, the gaze and time. At times it gathers; at others it spills over, disappearing before we can be certain of what we have seen.",
    ],
    flyer: {
      title: "Exhibition flyer",
      description: "The original Soft Boundary exhibition flyer, with dates and venue details.",
      previewAlt:
        "Soft Boundary exhibition flyer with the title やわらかな境界, dates and gallery details",
    },
    inquiry:
      "For questions about the exhibited works or purchases, contact the gallery. Inquiries are welcome after the exhibition has ended.",
    imageAlt: "Soft Boundary exhibition at GALLERY AND LINKS 81",
    imageAlts: [
      "Light installations and suspended fabric throughout the gallery",
      "An iridescent folded form casts colored light beside a fabric wall",
      "A cyan-lit sculpture faces fabric draped across the gallery walls",
      "Blue and yellow light falls across suspended fabric and floor sculptures",
      "A dark mesh form surrounds a violet light on the gallery floor",
      "Green and iridescent light fills sculptures along the gallery floor",
      "Colored reflections appear on a fabric partition beside blue-lit sculptures",
      "A yellow translucent form rests beneath illuminated draped fabric",
      "Red light glows inside a dark mesh sculpture",
      "Iridescent and yellow forms illuminate a corner of the gallery",
      "Violet and blue sculptures fill the room beneath hanging fabric",
      "A yellow form sits among soft white material at the base of a fabric wall",
      "A blue-lit central sculpture faces hanging fabric and circular mirrors",
    ],
  },
  ja: {
    title: "やわらかな境界",
    subtitle: "Soft Boundary",
    eyebrow: "占逸伦 個展",
    summary: "東京・GALLERY AND LINKS 81で開催するライトアートとインスタレーションの個展。",
    dates: "2026年9月15日（火）から9月19日（土）",
    hours: "12:00から18:00",
    finalDayHours: "最終日の9月19日（土）は12:00から16:00まで",
    venue: "GALLERY AND LINKS 81 本部会場 2F",
    address: "東京都中央区銀座2-14-1 シャルル銀座ビル",
    labels: {
      about: "本展について",
      exhibitionViews: "展示風景",
      galleryPage: "ギャラリーの展覧会情報",
      inquiry: "ギャラリーへのお問い合わせ",
      dates: "会期",
      hours: "開場時間",
      venue: "会場",
      language: "このプロジェクトの表示言語",
      nextWork: "次の作品",
    },
    statement: [
      "光は、もともと見えなかったものに、どのように形を与えるのだろう。",
      "感情や記憶、そして人と空間のあいだに生まれる関係には、実体がない。光は、形のなかったものをある瞬間の知覚のなかに立ち上がらせ、固定された形を与えることなく、束の間の輪郭を現すかのようにする。",
      "その輪郭は安定しない。人の動き、まなざし、時間とともに絶えず変化し、時に集まり、時に溢れ出し、まだ確かめられないうちに消えていく。",
    ],
    flyer: {
      title: "展覧会フライヤー",
      description: "会期と会場を記載した「やわらかな境界」の展覧会フライヤー。",
      previewAlt: "「やわらかな境界」展覧会フライヤー。英語タイトルSoft Boundary、会期、会場を記載",
    },
    inquiry:
      "展示作品やご購入については、ギャラリーへお問い合わせください。展覧会終了後もお問い合わせを受け付けています。",
    imageAlt: "GALLERY AND LINKS 81での「やわらかな境界」展示風景",
    imageAlts: [
      "ギャラリー全体に配置された光のインスタレーションと吊り下げられた布",
      "布の壁のそばで色の光を放つ、虹色の折り重なった立体",
      "壁に掛けられた布と向かい合う、水色に光る立体",
      "吊り下げられた布と床の立体に広がる青と黄色の光",
      "ギャラリーの床で紫の光を包む暗いメッシュの立体",
      "床に沿って並ぶ立体の中に広がる緑と虹色の光",
      "青く光る立体のそばで、布の間仕切りに映る色の反射",
      "光に照らされた布の下に置かれた黄色い半透明の立体",
      "暗いメッシュの立体の内側で光る赤い光",
      "ギャラリーの一角を照らす虹色と黄色の立体",
      "吊り下げられた布の下に並ぶ紫と青の立体",
      "布の壁の足元で、柔らかな白い素材に囲まれた黄色い立体",
      "吊り下げられた布と円形の鏡に向かい合う、中央の青い立体",
    ],
  },
};
