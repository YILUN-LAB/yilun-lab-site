import type { LightboxLabels } from "../../components/react/PhotoLightbox";

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
  lightbox: LightboxLabels;
  coverAlt: string;
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
    lightbox: {
      title: "Exhibition photographs",
      open: "View photograph",
      close: "Close image viewer",
      previous: "Previous photograph",
      next: "Next photograph",
      loading: "Loading image…",
      unavailable: "Full-size image unavailable. Showing preview.",
    },
    coverAlt:
      "Blue light fills cloudlike fibers beneath reflective forms and colored light on sheer fabric",
    imageAlt: "Soft Boundary exhibition at GALLERY AND LINKS 81",
    imageAlts: [
      "Colored light crosses sheer fabric beside a suspended circular mirror",
      "A violet glow shines through layers of dark mesh with distant colored reflections",
      "Turquoise light blooms through cloudlike fibers beside a reflective edge",
      "A golden folded form appears out of focus behind a translucent woven veil",
      "Iridescent folds scatter green and gold light across soft white fibers",
      "Yellow and green light streaks across sheer fabric beneath a blurred warm reflection",
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
    lightbox: {
      title: "展覧会の写真",
      open: "写真を拡大",
      close: "写真を閉じる",
      previous: "前の写真",
      next: "次の写真",
      loading: "画像を読み込み中…",
      unavailable: "元の画像を読み込めません。プレビューを表示しています。",
    },
    coverAlt: "鏡面の立体の下で雲のような繊維に満ちる青い光と、薄い布に映る色の光",
    imageAlt: "GALLERY AND LINKS 81での「やわらかな境界」展示風景",
    imageAlts: [
      "吊り下げられた円形の鏡のそばで、薄い布を横切る色の光",
      "遠くの色の反射を背景に、重なった暗いメッシュから漏れる紫の光",
      "鏡面の縁のそばで、雲のような繊維に広がるターコイズ色の光",
      "半透明の織物の向こうにぼんやりと見える金色の折り重なった形",
      "柔らかな白い繊維に緑と金色の光を散らす虹色のひだ",
      "ぼけた暖色の反射の下で、薄い布を横切る黄色と緑の光",
    ],
  },
};
