import project02Process from "./project-02-process.json" with { type: "json" };

type AigcContentSection = {
  description: string;
  translation: string;
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
};

type StoryboardCopy = {
  en: string;
  zh: string;
};

type AigcVideo = {
  src: string;
  poster: string;
  width: number;
  height: number;
  label: string;
};

export type AigcProject = {
  slug: string;
  title: string;
  titleZh: string;
  summary: string;
  overview?: {
    title: string;
    subtitle: string;
    translation: string;
    details?: {
      label: string;
      value: string;
    }[];
  };
  video?: AigcVideo;
  fullFilm?: AigcVideo & { duration: string };
  productionProcess?: {
    image: AigcContentSection["image"];
    steps: typeof project02Process.steps;
    iteration: string;
  };
  workflow?: Pick<AigcContentSection, "image">;
  brief?: AigcContentSection;
  productVisuals?: AigcContentSection;
  characterConsistency?: {
    description: string;
    translation: string;
    images: {
      src: string;
      alt: string;
      width: number;
      height: number;
      title: string;
      titleZh: string;
    }[];
  };
  sceneConsistency?: {
    description: string;
    translation: string;
    base: AigcContentSection["image"];
    images: AigcContentSection["image"][];
  };
  storyboardOverview?: AigcContentSection;
  storyboard?: {
    shots: {
      id: string;
      timeRange: string;
      framing: string;
      image: AigcContentSection["image"];
      action: StoryboardCopy;
      sound: StoryboardCopy;
      purpose: StoryboardCopy;
    }[];
  };
  imageLayout?: "fit-screen";
  images: {
    src: string;
    alt: string;
    width: number;
    height: number;
    caption?: string;
  }[];
};

// AIGC projects shown in the portfolio index.
export const aigcProjects: AigcProject[] = [
  {
    slug: "project-01",
    title: "01 AI AVATAR DESIGN",
    titleZh: "AI 个人形象设计",
    summary: "An interactive AIGC character identity study.",
    images: [],
  },
  {
    slug: "project-02",
    title: "02 AI CREATIVE TVC",
    titleZh: "AI 创意广告短片",
    summary: "An AIGC-driven commercial film created for AirPods Max, exploring how AI-generated imagery, motion and post-production can transform a personal listening experience into a distinctive visual narrative.",
    overview: {
      title: "AI CREATIVE TVC",
      subtitle: "AirPods Max · AIGC Commercial Film",
      translation: "这是一支以 AirPods Max 为主题、由 AIGC 驱动的创意广告短片，探索如何结合 AI 生成的影像、动态设计与后期制作，将个人聆听体验转化为独具辨识度的视觉叙事。",
      details: [
        {
          label: "ROLE",
          value: "Creative Direction / Visual Development / AIGC Production / Editing",
        },
        { label: "OUTPUT", value: "Hero Film / Key Visual / Social Cut" },
        { label: "YEAR", value: "2026" },
      ],
    },
    video: {
      src: "/aigc/project-02/airpods-max-hero-clean.mp4",
      poster: "/aigc/project-02/airpods-max-hero-clean.jpg",
      width: 1920,
      height: 1080,
      label: "AirPods Max AI 创意广告短片，默认静音循环播放",
    },
    fullFilm: {
      src: "/aigc/project-02/airpods-max-full-film-4k-web-v4.mp4",
      poster: "/aigc/project-02/airpods-max-full-film-poster-clean-v3.webp",
      width: 3844,
      height: 2160,
      duration: "01:11",
      label: "AirPods Max AI 创意广告完整影片，含声音，可控制播放进度和全屏观看",
    },
    productionProcess: {
      image: {
        src: "/aigc/project-02/airpods-max-production-process-horizontal-v2.svg",
        alt: "AirPods Max AIGC 横向制作流程图，从左到右依次为创意定位、叙事开发、视觉设定、分镜与关键帧、动态生成、后期制作、成片输出。产品、人物、场景三条一致性线索贯穿制作。",
        width: 3360,
        height: 960,
      },
      steps: project02Process.steps,
      iteration: project02Process.iteration,
    },
    workflow: {
      image: {
        src: "/aigc/project-02/airpods-max-workflow-panorama-v1.png",
        alt: "AirPods Max AIGC 广告的完整制作画布，从左到右展示产品和人物参考、场景与关键帧、视频生成及迭代节点之间的连接",
        width: 7904,
        height: 2142,
      },
    },
    brief: {
      description: "An AIGC creative commercial for AirPods Max, blending product visuals with a surreal urban narrative. Clean product design, character styling and a cohesive urban color palette emphasize technology, fashion and memorable imagery. Music, camera movement and an escalating sequence of surreal events shape the film’s emotional arc.",
      translation: "AirPods Max AIGC 创意广告｜融合产品视觉与超现实都市叙事｜强化科技感、时尚感与视觉记忆点｜提取简洁产品语言、人物造型、城市色彩体系｜结合音乐节奏、镜头运动与递进式超现实事件构建完整广告情绪。",
      image: {
        src: "/aigc/project-02/airpods-max-brief.png",
        alt: "紫色背景中，一位佩戴 AirPods Max 和蓝色眼镜、身穿绿色针织背心的人物侧面主视觉",
        width: 1673,
        height: 940,
      },
    },
    productVisuals: {
      description: "A soft lavender palette, matte ear cups and finely textured mesh establish the product’s visual language. Three-quarter, front, side and top views highlight the AirPods Max silhouette, proportions and material details, providing a consistent visual reference for its appearance throughout the film.",
      translation: "以淡紫色为主色调，通过哑光耳罩、网状头梁与织物耳垫建立产品的视觉基调。三分之四视角、正面、侧面与顶部视图共同呈现 AirPods Max 的轮廓、比例和材质细节，为短片中的产品呈现提供统一的视觉参考。",
      image: {
        src: "/aigc/project-02/airpods-max-product-views-row.png",
        alt: "淡紫色 AirPods Max 的三分之四、正面、侧面与顶部四个视角，在白色背景上横向排成一行",
        width: 2172,
        height: 724,
      },
    },
    characterConsistency: {
      description: "Starting from the original character reference, front, side and back views compare the base look, the addition of AirPods Max, and a change to a black shoulder bag. Facial features, hairstyle, body proportions and the core outfit remain consistent, keeping the character recognisable as the product and accessories change.",
      translation: "以人物原图为参考，通过正面、侧面与背面三视图，依次对比未佩戴耳机、加入 AirPods Max、替换为黑色肩包三个状态。保持面部特征、发型、身形比例与核心穿搭的一致性，确保人物在产品与配饰变化后仍具有稳定的辨识度。",
      images: [
        {
          src: "/aigc/project-02/characters-white-v1/reference.png",
          alt: "人物原始参考图：俯视角度下，角色穿绿色针织背心与长裤，搭配蓝色眼镜、蓝色高跟鞋和银色肩包",
          width: 1024,
          height: 1536,
          title: "REFERENCE",
          titleZh: "人物原图",
        },
        {
          src: "/aigc/project-02/characters-wide-v2/base.png",
          alt: "未佩戴耳机的角色全身三视图，穿绿色针织背心与长裤，搭配蓝色眼镜和银色肩包",
          width: 1536,
          height: 1024,
          title: "BASE LOOK",
          titleZh: "未戴耳机",
        },
        {
          src: "/aigc/project-02/characters-wide-v2/headphones.png",
          alt: "同一角色佩戴淡紫色 AirPods Max 的全身三视图，保留绿色穿搭与银色肩包",
          width: 1536,
          height: 1024,
          title: "HEADPHONES",
          titleZh: "佩戴耳机",
        },
        {
          src: "/aigc/project-02/characters-wide-v2/bag.png",
          alt: "同一角色佩戴 AirPods Max 并更换为黑色肩包的全身三视图",
          width: 1536,
          height: 1024,
          title: "BAG VARIATION",
          titleZh: "更换背包",
        },
      ],
    },
    sceneConsistency: {
      description: "A single street scene establishes the architectural character, city palette and natural light. Four variations extend this reference into an intersection, a view down the street, a café frontage and another street angle. Consistent architectural details, textures and visual tone connect the changing viewpoints into a coherent urban setting for the film.",
      translation: "以一张基础街景确立建筑特征、城市色彩与自然光氛围，再延展出街角路口、街道纵深、沿街咖啡馆与不同视角的街景。通过统一建筑细节、材质质感与整体影调，使不同机位下的场景保持连续、可识别，为短片叙事构建一致的城市环境。",
      base: {
        src: "/aigc/project-02/scenes-clean-v1/base.png",
        alt: "基础场景：红砖建筑与消防楼梯围合的城市街道，前景有路灯、交通信号灯和行人，远处延伸至高层建筑",
        width: 736,
        height: 981,
      },
      images: [
        {
          src: "/aigc/project-02/scenes-clean-v1/scene-01.png",
          alt: "衍生场景一：延续红砖建筑与街灯的街角路口，斑马线上有行人、自行车与黄色出租车",
          width: 2560,
          height: 1440,
        },
        {
          src: "/aigc/project-02/scenes-clean-v1/scene-02.png",
          alt: "衍生场景二：从路口望向街道纵深，两侧建筑、沿街店铺与车辆延续基础场景的城市氛围",
          width: 2560,
          height: 1440,
        },
        {
          src: "/aigc/project-02/scenes-clean-v1/scene-03.png",
          alt: "衍生场景三：沿街咖啡馆的遮阳篷、木质桌椅与砖墙消防楼梯，远处街道延伸至高楼",
          width: 2560,
          height: 1440,
        },
        {
          src: "/aigc/project-02/scenes-clean-v1/scene-04.png",
          alt: "衍生场景四：从另一侧人行道观察街景，红砖建筑、消防楼梯与远处高楼延续统一的城市视觉",
          width: 2560,
          height: 1440,
        },
      ],
    },
    storyboardOverview: {
      description: "24 key frames drawn from the final film trace the shift from city noise to a personal world of music.",
      translation: "基于最终成片整理的 24 格关键分镜，呈现从城市噪声到个人音乐世界的叙事变化。",
      image: {
        src: "/aigc/project-02/storyboard/airpods-max-storyboard-overview-v1.png",
        alt: "AirPods Max 创意广告的 24 格黑白手绘分镜总览，包含镜号、时间点、景别与动作注释，依次呈现城市噪声、戴上耳机、泡泡互动、街头舞步、悬浮车流、建筑开花及品牌片尾。",
        width: 1536,
        height: 1024,
      },
    },
    storyboard: {
      shots: [
        {
          id: "reality",
          timeRange: "00:02–00:04",
          framing: "MEDIUM SHOT · SIDE TRACKING",
          image: {
            src: "/aigc/project-02/storyboard/01-reality.png",
            alt: "故事板第一镜：未戴耳机的主角侧身走过繁忙城市街道，身后是车流、沿街建筑与施工围挡",
            width: 3844,
            height: 2160,
          },
          action: {
            en: "The protagonist walks through a busy city street, surrounded by traffic.",
            zh: "主角行走在繁忙的城市街道，车流从身旁经过。",
          },
          sound: {
            en: "Traffic / Horns / City Ambience",
            zh: "车流声 / 鸣笛声 / 城市环境声",
          },
          purpose: {
            en: "Establish the noisy everyday reality before the shift into her personal listening world.",
            zh: "建立喧闹的日常现实，为进入个人音乐世界做铺垫。",
          },
        },
        {
          id: "reach-for-headphones",
          timeRange: "00:12.800",
          framing: "CLOSE-UP · BAG POV",
          image: {
            src: "/aigc/project-02/storyboard/frames-clean-v1/02.png",
            alt: "从包内仰望主角，她伸手取出 AirPods Max 耳机，城市天空出现在包口后方",
            width: 3844,
            height: 2160,
          },
          action: {
            en: "From inside her bag, we see her reach in and take out AirPods Max.",
            zh: "镜头从包内向上看，主角伸手取出 AirPods Max。",
          },
          sound: {
            en: "City Ambience / Bag Rustle",
            zh: "城市环境声 / 包袋摩擦声",
          },
          purpose: {
            en: "Introduce the product through an intimate everyday gesture, bringing us into her personal space.",
            zh: "以贴近日常的动作引出产品，让视角进入主角的私人空间。",
          },
        },
        {
          id: "put-on-headphones",
          timeRange: "00:15.200",
          framing: "CLOSE-UP · FRONTAL",
          image: {
            src: "/aigc/project-02/storyboard/frames-clean-v1/03.png",
            alt: "主角在城市街道上戴上淡紫色 AirPods Max，双手扶住耳罩",
            width: 3844,
            height: 2160,
          },
          action: {
            en: "She puts on the headphones, holding the ear cups as the city continues around her.",
            zh: "主角戴上耳机，双手扶住耳罩，城市仍在身后运转。",
          },
          sound: {
            en: "City Ambience / Music Intro",
            zh: "城市环境声 / 音乐前奏",
          },
          purpose: {
            en: "Mark the threshold between the busy street and her own listening experience.",
            zh: "以佩戴动作建立转折，从繁忙街道过渡到个人聆听体验。",
          },
        },
        {
          id: "noise-cancellation",
          timeRange: "00:17.800",
          framing: "EXTREME CLOSE-UP · PRODUCT DETAIL",
          image: {
            src: "/aigc/project-02/storyboard/frames-clean-v1/04.png",
            alt: "AirPods Max 耳罩与控制按钮的近距离特写，主角用手指开启降噪",
            width: 3844,
            height: 2160,
          },
          action: {
            en: "A fingertip presses the noise-control button in an intimate product close-up.",
            zh: "镜头贴近耳罩，指尖按下噪声控制按钮，开启降噪。",
          },
          sound: {
            en: "Button Click / City Fades / Music Rises",
            zh: "按键声 / 城市声渐弱 / 音乐渐强",
          },
          purpose: {
            en: "Make one small interaction the turning point that opens a different experience of the city.",
            zh: "用一个微小的产品交互作为转折，开启对城市的全新感知。",
          },
        },
        {
          id: "suspended-bubble",
          timeRange: "00:31.000",
          framing: "MEDIUM CLOSE-UP · SIDE VIEW",
          image: {
            src: "/aigc/project-02/storyboard/frames-clean-v1/05.png",
            alt: "戴着 AirPods Max 的主角伸手触碰悬停在城市街道中的透明泡泡",
            width: 3844,
            height: 2160,
          },
          action: {
            en: "She reaches toward a bubble suspended in mid-air, exploring a city that no longer follows ordinary rules.",
            zh: "主角伸手触碰悬停的泡泡，探索不再遵循日常规律的城市。",
          },
          sound: {
            en: "Music / Light, Airy Accents",
            zh: "音乐 / 轻盈的空气感音效",
          },
          purpose: {
            en: "Turn the listening experience into a playful, tangible encounter with the surreal.",
            zh: "将聆听体验转化为可触碰的超现实瞬间，营造轻盈而有趣的情绪。",
          },
        },
        {
          id: "floating-traffic",
          timeRange: "00:52.400",
          framing: "WIDE SHOT · LOW ANGLE",
          image: {
            src: "/aigc/project-02/storyboard/frames-clean-v2/08-0052400.png",
            alt: "低机位仰拍主角手持手机走过街道，侧头望向悬浮在上方与周围的汽车",
            width: 3844,
            height: 2160,
          },
          action: {
            en: "She walks calmly through the street as cars float above and around her.",
            zh: "主角从容穿过街道，汽车在头顶与周围悬浮。",
          },
          sound: {
            en: "Driving Beat / Expansive Music",
            zh: "推进的节拍 / 开阔的音乐层次",
          },
          purpose: {
            en: "Expand the surreal transformation to the whole street, contrasting her calm with the scale of the spectacle.",
            zh: "将超现实变化扩展至整条街道，以主角的从容衬托场景的震撼。",
          },
        },
        {
          id: "city-in-bloom",
          timeRange: "00:59.800",
          framing: "WIDE SHOT · SIDE VIEW",
          image: {
            src: "/aigc/project-02/storyboard/frames-clean-v1/09.png",
            alt: "主角佩戴耳机走过街道，身后建筑外墙化为大片盛开的粉白色鲜花",
            width: 3844,
            height: 2160,
          },
          action: {
            en: "The building facade blossoms into flowers as she continues through the city, immersed in her music.",
            zh: "主角沉浸在音乐中继续前行，建筑外墙化为盛开的鲜花。",
          },
          sound: {
            en: "Musical Climax / Melodic Release",
            zh: "音乐高潮 / 旋律释放",
          },
          purpose: {
            en: "Bring the journey to an emotional peak, leaving a vivid image of a world transformed by listening.",
            zh: "将叙事推向情绪高潮，留下聆听改变城市感知的鲜明视觉记忆。",
          },
        },
      ],
    },
    images: [],
  },
  {
    slug: "project-03",
    title: "03 OPERATION DESIGN",
    titleZh: "生活慢半拍 · 小红书运营设计",
    summary: "A social media campaign design inspired by reading, unhurried meals, pet companionship and quiet weekends at home. Hand-drawn illustrations, expressive lettering and a warm palette connect key visuals, UGC activities and promotional materials, inviting young people to share their own slow-living moments.",
    overview: {
      title: "OPERATION DESIGN",
      subtitle: "Slow Living · Social Media Campaign",
      translation: "以「周末慢半拍」为主题的小红书运营设计，从阅读、慢食、宠物陪伴与居家放空中提取灵感。结合手绘插画、自然的标题字形与明快温暖的色彩，延展活动主视觉、UGC 互动玩法及宣传物料，邀请年轻人分享「慢半拍时刻」，找到自在的周末节奏。",
      details: [
        {
          label: "ROLE",
          value: "Visual Design / Illustration / Typography / Campaign Planning",
        },
        {
          label: "OUTPUT",
          value: "Key Visual / Social Posts / UGC Campaign / Merchandise",
        },
        { label: "YEAR", value: "2026" },
      ],
    },
    imageLayout: "fit-screen",
    images: [
      "PDF 第 1 页：周末慢半拍活动主视觉，以手绘插画呈现阅读、慢食、宠物陪伴与居家休息。",
      "PDF 第 2 页：慢慢看书、慢慢吃饭、慢慢陪伴三张小红书活动海报。",
      "PDF 第 3 页：UGC 活动玩法，展示慢半拍时刻的参与方式、话题与活动奖励。",
      "PDF 第 4 页：周末到了，你真的慢下来了吗？周末慢半拍的活动背景与设计理念。",
      "PDF 第 5 页：字体设计，展示周末慢半拍的手写标题字形与设计说明。",
      "PDF 第 6 页：色彩规范，以明快、温暖、松弛为关键词的八色配色与插画元素。",
      "PDF 第 7 页：设计推导过程，包含元素提取、构图与线稿、基础铺色、光影塑形和添加细节。",
      "PDF 第 8 页：广告与宣传物料，展示周末慢半拍的户外橱窗海报应用。",
      "PDF 第 9 页：周末慢半拍手绘主视觉在户外广告牌中的应用。",
      "PDF 第 10 页：周末慢半拍视觉在笔记本、卡片与文具中的应用。",
      "PDF 第 11 页：周末慢半拍的帆布袋、徽章、杯具与包装等活动周边设计。",
      "PDF 第 12 页：周末慢半拍角色与日常物件的创意挂件设计。",
    ].map((alt, index) => ({
      src: `/aigc/project-03/pdf-v2/page-${String(index + 1).padStart(2, "0")}.webp`,
      alt,
      width: 3200,
      height: 1813,
    })),
  },
];

export const AIGC_RETURN_HREF = "/?scene=3";

export const getAigcProject = (slug: string) =>
  aigcProjects.find((project) => project.slug === slug);
