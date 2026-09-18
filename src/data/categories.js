import { asset } from '../utils/asset'

export const categories = [
  {
    id: 'baking',
    slug: 'baking-supplies',
    name: 'خامات الحلويات والكيك',
    tagline: 'خامات أصلية لصنع ألذ الحلويات',
    description:
      'كل ما تحتاجه لتحضير الكيك والحلويات: طحين خاص، كريمة، شوكولاتة، ألوان طعام، قوالب وأدوات التزيين.',
    icon: 'Cake',
    image: asset('/images/categories/baking-supplies.jpg'),
    color: '#db8c33',
  },
  {
    id: 'candy',
    slug: 'candy-sweets',
    name: 'الكاندي والحلويات',
    tagline: 'كنز من السكاكر والحلويات الفاخرة',
    description:
      'تشكيلة واسعة من الكاندي، الجيلي، المارشميلو، اللولي والدراج الفاخر لتزيين حلوياتك وصناديقك.',
    icon: 'Candy',
    image: asset('/images/categories/candy-sweets.jpg'),
    color: '#c64e60',
  },
  {
    id: 'birthday',
    slug: 'birthday',
    name: 'مستلزمات أعياد الميلاد',
    tagline: 'اجعل يوم ميلادك يوماً لا يُنسى',
    description:
      'زينات، بالونات، شموع مميزة، تيجان وأدوات تزيين طاولة تجعل حفلة الميلاد أجمل وأمتع.',
    icon: 'PartyPopper',
    image: asset('/images/categories/birthday.jpg'),
    color: '#c64e60',
  },
  {
    id: 'party',
    slug: 'party-supplies',
    name: 'مستلزمات الحفلات',
    tagline: 'كل ما يجعل حفلتك ممتعة ومميزة',
    description:
      'أدوات مائدة تجريبية أنيقة، بالونات، رولات خلفيات، مغناطيسات وألعاب حفلات بجودة عالية.',
    icon: 'Sparkles',
    image: asset('/images/categories/party-supplies.jpg'),
    color: '#e4a44f',
  },
  {
    id: 'packaging',
    slug: 'packaging-gifts',
    name: 'التغليف والهدايا',
    tagline: 'صناديق وأشرطة تغليف تليق بمنتجاتك',
    description:
      'صناديق كيك وهدايا، أكياس شفافة، شرائط ساتان، كروت هدايا وأدوات تغليف احترافية.',
    icon: 'Gift',
    image: asset('/images/categories/packaging-gifts.jpg'),
    color: '#a35920',
  },
]