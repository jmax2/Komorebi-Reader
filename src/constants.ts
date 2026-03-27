import { Sentence } from "./types";

export const MOCK_DATA: Sentence[] = [
  {
    id: 1,
    ja_sentence: "むかしむかし、あるところにおじいさんとおばあさんが住んでいました。",
    en_sentence: "Once upon a time, there lived an old man and an old woman.",
    words: [
      { "ja": "むかしむかし", "reading": "むかしむかし", "en": "Once upon a time" },
      { "ja": "ある", "reading": "ある", "en": "a certain" },
      { "ja": "ところ", "reading": "ところ", "en": "place" },
      { "ja": "に", "reading": "に", "en": "in" },
      { "ja": "おじいさん", "reading": "おじいさん", "en": "old man" },
      { "ja": "と", "reading": "と", "en": "and" },
      { "ja": "おばあさん", "reading": "おばあさん", "en": "old woman" },
      { "ja": "が", "reading": "が", "en": "subject marker" },
      { "ja": "住んでいました", "reading": "すんでいました", "en": "lived" }
    ]
  },
  {
    id: 2,
    ja_sentence: "おじいさんは山へしば刈りに、おばあさんは川へ洗濯に行きました。",
    en_sentence: "The old man went to the mountains to cut grass, and the old woman went to the river to wash clothes.",
    words: [
      { "ja": "おじいさん", "reading": "おじいさん", "en": "old man" },
      { "ja": "は", "reading": "は", "en": "topic marker" },
      { "ja": "山", "reading": "やま", "en": "mountain" },
      { "ja": "へ", "reading": "へ", "en": "to" },
      { "ja": "しば刈り", "reading": "しばかり", "en": "cutting grass" },
      { "ja": "に", "reading": "に", "en": "for" },
      { "ja": "おばあさん", "reading": "おばあさん", "en": "old woman" },
      { "ja": "は", "reading": "は", "en": "topic marker" },
      { "ja": "川", "reading": "かわ", "en": "river" },
      { "ja": "へ", "reading": "へ", "en": "to" },
      { "ja": "洗濯", "reading": "せんたく", "en": "washing" },
      { "ja": "に", "reading": "に", "en": "for" },
      { "ja": "行きました", "reading": "いきました", "en": "went" }
    ]
  },
  {
    id: 3,
    ja_sentence: "ある日、おばあさんが川で洗濯をしていると、大きな桃が流れてきました。",
    en_sentence: "One day, while the old woman was washing clothes in the river, a big peach came floating down.",
    words: [
      { "ja": "ある日", "reading": "あるひ", "en": "one day" },
      { "ja": "おばあさん", "reading": "おばあさん", "en": "old woman" },
      { "ja": "が", "reading": "が", "en": "subject marker" },
      { "ja": "川", "reading": "かわ", "en": "river" },
      { "ja": "で", "reading": "で", "en": "at" },
      { "ja": "洗濯", "reading": "せんたく", "en": "washing" },
      { "ja": "を", "reading": "を", "en": "object marker" },
      { "ja": "している", "reading": "している", "en": "doing" },
      { "ja": "と", "reading": "と", "en": "when" },
      { "ja": "大きな", "reading": "おおきな", "en": "big" },
      { "ja": "桃", "reading": "もも", "en": "peach" },
      { "ja": "が", "reading": "が", "en": "subject marker" },
      { "ja": "流れてきました", "reading": "ながれてきました", "en": "came floating" }
    ]
  }
];
