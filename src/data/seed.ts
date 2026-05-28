import { CreedDocument } from '../types';
import { WCF_DATA } from './wcf';

const INITIAL_DATA: CreedDocument[] = [
  {
    id: 'geneva-1',
    title: 'Genevan Catechism - Q. 1',
    content: 'What is the chief end of human life?\n\nTo know God by whom men were created.',
    content_original: 'Quelle est la principale fin de la vie humaine?\n\nC\'est de connoistre Dieu par lequel les hommes ont esté creez.',
    language_original: 'french',
    year: 1542,
    proofs: [
      { verseId: 'John 17:3', display: 'John 17:3' }
    ],
    connections: ['hc-1', 'wsc-1'],
    history_link: null,
  },
  {
    id: 'apostles-1',
    title: "Apostles' Creed - Article I",
    content: 'I believe in God, the Father almighty, creator of heaven and earth.',
    content_original: 'Credo in Deum Patrem omnipotentem, Creatorem caeli et terrae.',
    language_original: 'latin',
    year: 390,
    proofs: [{ verseId: 'Genesis 1:1', display: 'Genesis 1:1' }],
    connections: ['nicene-1'],
    history_link: null,
  },
  {
    id: 'nicene-1',
    title: 'Nicene Creed - Article I',
    content: 'We believe in one God, the Father Almighty, Maker of heaven and earth, and of all things visible and invisible.',
    content_original: 'Πιστεύομεν εἰς ἕνα Θεὸν Πατέρα παντοκράτορα, ποιητὴν οὐρανοῦ καὶ γῆς, ὁρατῶν τε πάντων καὶ ἀοράτων.',
    language_original: 'greek',
    year: 325,
    proofs: [
      { verseId: 'Deuteronomy 6:4', display: 'Deuteronomy 6:4' },
      { verseId: 'Isaiah 44:6', display: 'Isaiah 44:6' }
    ],
    connections: ['apostles-1', 'athanasian-1', 'chalcedon-1', 'wcf-2-1', 'bcf-1', 'augsburg-1', 'thirty-nine-1'],
    history_link: 'apostles-1',
  },
  {
    id: 'athanasian-1',
    title: 'Athanasian Creed - Introduction',
    content: 'Whosoever will be saved, before all things it is necessary that he hold the catholic faith. Which faith except every one do keep whole and undefiled; without doubt he shall perish everlastingly. And the catholic faith is this: That we worship one God in Trinity, and Trinity in Unity.',
    content_original: 'Quicumque vult salvus esse, ante omnia opus est, ut teneat catholicam fidem: Quam nisi quisque integram inviolatamque servaverit, absque dubio in aeternum peribit. Fides autem catholica haec est: ut unum Deum in Trinitate, et Trinitatem in unitate veneremur.',
    language_original: 'latin',
    year: 500,
    proofs: [
      { verseId: 'Mark 16:16', display: 'Mark 16:16' },
      { verseId: 'Matthew 28:19', display: 'Matthew 28:19' }
    ],
    connections: ['nicene-1', 'chalcedon-1', 'augsburg-1', 'thirty-nine-1', 'bcf-1', 'wcf-2-1'],
    history_link: 'nicene-1',
  },
  {
    id: 'chalcedon-1',
    title: 'Chalcedonian Definition',
    content: 'We, then, following the holy Fathers, all with one consent, teach men to confess one and the same Son, our Lord Jesus Christ, the same perfect in Godhead and also perfect in manhood; truly God and truly man...',
    content_original: 'Ἑπόμενοι τοίνυν τοῖς ἁγίοις πατράσιν ἕνα καὶ τὸν αὐτὸν ὁμολογεῖν υἱὸν τὸν κύριον ἡμῶν Ἰησοῦν Χριστὸν συμφώνως ἅπαντες ἐκδιδάσκομεν, τέλειον τὸν αὐτὸν ἐν θεότητι καὶ τέλειον τὸν αὐτὸν ἐν ἀνθρωπότητι, θεὸν ἀληθῶς καὶ ἄνθρωπον ἀληθῶς...',
    language_original: 'greek',
    year: 451,
    proofs: [
      { verseId: 'John 1:14', display: 'John 1:14' },
      { verseId: 'Philippians 2:6-7', display: 'Phil 2:6-7' }
    ],
    connections: ['nicene-1'],
    history_link: 'nicene-1',
  },
  {
    id: 'augsburg-1',
    title: 'Augsburg Confession - Article 1: Of God',
    content: 'Our Churches, with common consent, do teach that the decree of the Council of Nicaea concerning the Unity of the Divine Essence and concerning the Three Persons, is true and to be believed without any doubting...',
    year: 1530,
    proofs: [
      { verseId: 'Deuteronomy 6:4', display: 'Deuteronomy 6:4' },
      { verseId: 'Matthew 28:19', display: 'Matthew 28:19' }
    ],
    connections: ['nicene-1', 'thirty-nine-1', 'bcf-1'],
    history_link: 'nicene-1',
  },
  {
    id: 'thirty-nine-1',
    title: 'Thirty-Nine Articles - Article 1: Of Faith in the Holy Trinity',
    content: 'There is but one living and true God, everlasting, without body, parts, or passions; of infinite power, wisdom, and goodness; the Maker, and Preserver of all things both visible and invisible. And in unity of this Godhead there be three Persons, of one substance, power, and eternity; the Father, the Son, and the Holy Ghost.',
    year: 1571,
    proofs: [
      { verseId: '1 Corinthians 8:4', display: '1 Cor 8:4' },
      { verseId: '1 Timothy 1:17', display: '1 Tim 1:17' }
    ],
    connections: ['nicene-1', 'augsburg-1', 'wcf-2-1'],
    history_link: 'augsburg-1',
  },
  {
    id: 'hc-1',
    title: 'Heidelberg Catechism - Lord\'s Day 1, Q. 1',
    content: 'What is thy only comfort in life and death?\n\nThat I with body and soul, both in life and death, am not my own, but belong unto my faithful Savior Jesus Christ; who, with his precious blood, has fully satisfied for all my sins, and delivered me from all the power of the devil...',
    content_original: 'Was ist dein einiger Trost im Leben und im Sterben?\n\nDaß ich mit Leib und Seele, beides im Leben und im Sterben, nicht mein, sondern meines getreuen Heilandes Jesu Christi eigen bin, der mit seinem teuren Blute für alle meine Sünden vollkömmlich bezahlet, und mich aus aller Gewalt des Teufels erlöset hat...',
    language_original: 'german',
    year: 1563,
    proofs: [
      { verseId: 'Romans 14:7-8', display: 'Rom 14:7, 8' },
      { verseId: '1 Corinthians 6:19', display: '1 Cor 6:19' },
      { verseId: '1 Peter 1:18-19', display: '1 Pet 1:18, 19' }
    ],
    connections: ['bcf-1', 'wsc-1', 'dort-1'],
    history_link: null,
  },
  {
    id: 'bcf-1',
    title: 'Belgic Confession - Article 1: There Is One Only God',
    content: 'We all believe with the heart and confess with the mouth that there is one only simple and spiritual Being, which we call God; and that He is eternal, incomprehensible, invisible, immutable, infinite, almighty, perfectly wise, just, good, and the overflowing fountain of all good.',
    content_original: 'Nous croyons tous de cœur & confessons de bouche, qu’il y a une seule & simple essence spirituelle, que nous appelons Dieu, eternel, incomprehensible, invisible, immuable, infini, Tout-puissant, tout sage, iuste, & bon, & tres-abondante fontaine de tous biens.',
    language_original: 'french',
    year: 1561,
    proofs: [
      { verseId: 'Ephesians 4:6', display: 'Ephesians 4:6' },
      { verseId: '1 Timothy 1:17', display: '1 Timothy 1:17' }
    ],
    connections: ['wcf-2-1', 'nicene-1', 'hc-1', 'dort-1'],
    history_link: 'nicene-1',
  },
  {
    id: 'dort-1',
    title: 'Canons of Dort - First Head of Doctrine, Article 1',
    content: 'As all men have sinned in Adam, lie under the curse, and are deserving of eternal death, God would have done no injustice by leaving them all to perish and delivering them over to condemnation on account of sin, according to the words of the apostle: "That every mouth may be stopped, and all the world may become guilty before God" (Rom. 3:19).',
    content_original: 'Cum omnes homines in Adamo peccaverint, et rei sint facti maledictionis et mortis aeternae, Deus nemini fecisset injuriam, si universum genus humanum in peccato et maledictione relinquere, ac propter peccatum damnare voluisset, secundum illa Apostoli: Ut omne os obstruatur, et obnoxius fiat omnis mundus Deo. Rom. 3:19.',
    language_original: 'latin',
    year: 1619,
    proofs: [
      { verseId: 'Romans 3:19', display: 'Romans 3:19' },
      { verseId: 'Romans 3:23', display: 'Romans 3:23' },
      { verseId: 'Romans 6:23', display: 'Romans 6:23' }
    ],
    connections: ['bcf-1', 'hc-1', 'wcf-3-1'],
    history_link: 'bcf-1',
  },
  {
    id: 'bcf-2',
    title: 'Belgic Confession - Article 2: By What Means God Is Made Known Unto Us',
    content: 'We know Him by two means: First, by the creation, preservation, and government of the universe; which is before our eyes as a most elegant book, wherein all creatures, great and small, are as so many characters leading us to see clearly the invisible things of God, even his everlasting power and divinity, as the apostle Paul says (Rom. 1:20). All which things are sufficient to convince men and leave them without excuse. Secondly, He makes Himself more clearly and fully known to us by His holy and divine Word, that is to say, as far as is necessary for us to know in this life, to His glory and our salvation.',
    content_original: 'Nous le cognoissons par deux moyens. Premierement, par la creation, conseruation, & gouuernement de tout ce monde. Car il est deuant noz yeux comme vn beau liure, auquel toutes creatures, grandes & petites soint comme lettres, pour nous donner à contempler les choses inuisibles de Dieu, assauoir sa puissance eternelle & diuinité, comme dict l’Apostre sainct Paul, aux Romains (1. 20.) lesquelles choses toutes suffisent pour conuaincre les hommes, & leur oster toute excuse. Secondement, il se faict cognoistre à nous encore plus euidemment & plus clairement par sa saincte & Diuine parolle : assauoir, entant qu’il nous est de besoin en ceste vie, pour sa gloire & à nostre salut.',
    language_original: 'french',
    year: 1561,
    proofs: [
      { verseId: 'Romans 1:20', display: 'Romans 1:20' },
      { verseId: 'Psalm 19:1-3', display: 'Psalm 19:1-3' },
      { verseId: 'Hebrews 1:1-2', display: 'Hebrews 1:1-2' }
    ],
    connections: ['wcf-1-1'],
    history_link: null,
  },
  {
    id: 'hc-2',
    title: 'Heidelberg Catechism - Lord\'s Day 1, Q. 2',
    content: 'How many things are necessary for thee to know, that thou, enjoying this comfort, mayest live and die happily?\n\nThree; the first, how great my sins and miseries are; the second, how I may be delivered from all my sins and miseries; the third, how I shall express my gratitude to God for such deliverance.',
    content_original: 'Wie viele Stücke sind dir nötig zu wissen, daß du in diesem Troste seliglich leben und sterben könnest?\n\nDrei Stücke: Erstlich, wie groß meine Sünde und Elend sei. Zum andern, wie ich von allen meinen Sünden und Elend erlöset werde. Und zum dritten, wie ich Gott für solche Erlösung soll dankbar sein.',
    language_original: 'german',
    year: 1563,
    proofs: [
      { verseId: 'Romans 3:9-10', display: 'Rom 3:9, 10' },
      { verseId: '1 John 1:10', display: '1 John 1:10' },
      { verseId: 'John 17:3', display: 'John 17:3' }
    ],
    connections: ['bcf-2'],
    history_link: null,
  },
  {
    id: 'dort-2',
    title: 'Canons of Dort - First Head of Doctrine, Article 2',
    content: 'But in this the love of God was manifested, that he sent his only begotten Son into the world, that whosoever believeth on him should not perish, but have everlasting life. 1 John 4:9; John 3:16.',
    content_original: 'In hoc vero manifestata est caritas Dei, quod Filium suum unigenitum misit in mundum, ut omnis qui credit in eum non pereat, sed habeat vitam aeternam. 1 Joan. 4:9. Joan. 3:16.',
    language_original: 'latin',
    year: 1619,
    proofs: [
      { verseId: '1 John 4:9', display: '1 John 4:9' },
      { verseId: 'John 3:16', display: 'John 3:16' }
    ],
    connections: ['bcf-1', 'hc-1', 'wcf-8-1'],
    history_link: 'bcf-1',
  },
  {
    id: 'bcf-3',
    title: 'Belgic Confession - Article 3: The Written Word of God',
    content: 'We confess that this Word of God was not sent nor delivered by the will of man, but that men spake from God, being moved by the Holy Spirit, as the apostle Peter says; and that afterwards God, from a special care which He has for us and our salvation, commanded His servants, the prophets and apostles, to commit His revealed Word to writing; and He Himself wrote with His own finger the two tables of the law. Therefore we call such writings holy and divine Scriptures.',
    content_original: 'Nous confessons que ceste Parolle de Dieu n\'a pas esté apportee n\'y liuree par volonté humaine: ains que les saincts hommes de Dieu ont parlé estans poussez par le sainct Esprit, comme dit S. Pierre. Mais depuis que nostre Dieu, pour le soin singulier qu\'il a de nous & de nostre salut, a commandé à ses seruiteurs les Prophetes & Apostres de mettre ses oracles par escrit: & luy mesme a escrit de son doigt les deux tables de la loy. Et pource nous appellons telles escritures, Sainctes & Diuines Escritures.',
    language_original: 'french',
    year: 1561,
    proofs: [
      { verseId: '2 Peter 1:21', display: '2 Peter 1:21' },
      { verseId: 'Exodus 31:18', display: 'Exodus 31:18' }
    ],
    connections: ['wcf-1-2'],
    history_link: null,
  },
  {
    id: 'lbcf-1-1',
    title: '1689 London Baptist Confession - Chapter 1: Of the Holy Scriptures, Paragraph 1',
    content: "The Holy Scripture is the only sufficient, certain, and infallible rule of all saving knowledge, faith, and obedience, although the light of nature, and the works of creation and providence do so far manifest the goodness, wisdom, and power of God, as to leave men inexcusable; yet are they not sufficient to give that knowledge of God and His will which is necessary unto salvation. Therefore it pleased the Lord at sundry times and in divers manners to reveal Himself, and to declare that His will unto His church; and afterward for the better preserving and propagating of the truth, and for the more sure establishment and comfort of the church against the corruption of the flesh, and the malice of Satan, and of the world, to commit the same wholly unto writing; which maketh the Holy Scriptures to be most necessary, those former ways of God's revealing His will unto His people being now ceased.",
    year: 1689,
    proofs: [
      { verseId: '2 Timothy 3:15-17', display: '2 Tim. 3:15-17' },
      { verseId: 'Isaiah 8:20', display: 'Isa. 8:20' }
    ],
    connections: ['wcf-1-1'],
    history_link: 'wcf-1-1',
  }
];

export const SEED_DATA: CreedDocument[] = [...INITIAL_DATA, ...WCF_DATA];
