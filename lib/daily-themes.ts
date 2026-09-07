export interface DailyTheme {
  theme: string;
  bibleReference: string;
  bibleText: string;
  reflection: string;
  prayer: string;
}

export const dailyThemes: DailyTheme[] = [
  {
    theme: 'Fé e Confiança',
    bibleReference: 'Hebreus 11:1',
    bibleText: 'Ora, a fé é a certeza das coisas que se esperam, a convicção de fatos que não se vêem.',
    reflection: 'A fé não é a ausência de dúvidas, mas a coragem de seguir em frente mesmo quando não enxergamos o caminho completo. Hoje, permita-se confiar que há um propósito maior guiando seus passos.',
    prayer: 'Senhor, aumenta a minha fé. Ajuda-me a confiar em Ti, mesmo quando não consigo ver o caminho à frente. Sei que Teus planos são maiores que os meus. Fortalece meu coração para caminhar com confiança. Amém.',
  },
  {
    theme: 'Gratidão',
    bibleReference: '1 Tessalonicenses 5:18',
    bibleText: 'Em tudo dai graças, porque esta é a vontade de Deus em Cristo Jesus para convosco.',
    reflection: 'Ser grato não significa ignorar as dificuldades, mas reconhecer que, mesmo em meio aos desafios, existem bênçãos ao nosso redor. Que possamos enxergar com olhos de gratidão.',
    prayer: 'Pai, obrigado por tudo o que tens feito em minha vida. Pelos momentos bons e também pelos desafios que me fortalecem. Abre meus olhos para enxergar Tuas bênçãos diárias. Amém.',
  },
  {
    theme: 'Paz',
    bibleReference: 'João 14:27',
    bibleText: 'Deixo-vos a paz, a minha paz vos dou; não vo-la dou como o mundo a dá. Não se turbe o vosso coração, nem se atemorize.',
    reflection: 'A paz que vem de Deus não depende das circunstâncias externas. Ela é uma ancoragem interior que nos mantém firmes mesmo quando tudo ao redor parece caótico.',
    prayer: 'Senhor, derrama Tua paz sobre mim. Acalma minha mente, tranquiliza meu coração. Que eu possa descansar em Ti, sabendo que estás no controle de todas as coisas. Amém.',
  },
  {
    theme: 'Força',
    bibleReference: 'Filipenses 4:13',
    bibleText: 'Posso todas as coisas naquele que me fortalece.',
    reflection: 'Nossa força não vem de nós mesmos, mas dAquele que nos sustenta. Nos dias em que sentimos fraqueza, é justamente aí que o poder de Deus se manifesta.',
    prayer: 'Deus, sei que a minha força vem de Ti. Nos momentos de fraqueza, sustenta-me. Dá-me coragem para enfrentar este dia com a certeza de que não estou sozinho. Amém.',
  },
  {
    theme: 'Amor',
    bibleReference: '1 Coríntios 13:4-7',
    bibleText: 'O amor é paciente, é benigno; o amor não é invejoso, não se vangloria, não se ensoberbece. Tudo sofre, tudo crê, tudo espera, tudo suporta.',
    reflection: 'O amor verdadeiro é uma escolha diária. Não é apenas sentimento, mas ação. Como você pode demonstrar amor hoje — a si mesmo e aos que estão ao seu redor?',
    prayer: 'Senhor, ensina-me a amar como Tu amas. Com paciência, bondade e sem medida. Que o Teu amor flua através de mim e alcance todos ao meu redor. Amém.',
  },
  {
    theme: 'Esperança',
    bibleReference: 'Jeremias 29:11',
    bibleText: 'Porque eu sei os planos que tenho para vós, diz o Senhor, planos de paz e não de mal, para vos dar um futuro e uma esperança.',
    reflection: 'Mesmo quando o presente parece incerto, podemos descansar na promessa de que Deus tem planos de bem para nós. A esperança é a luz que nos guia nos dias mais escuros.',
    prayer: 'Pai, renova minha esperança. Ajuda-me a confiar nos Teus planos, mesmo quando não entendo o que está acontecendo. Sei que tens um futuro bom preparado para mim. Amém.',
  },
  {
    theme: 'Renovação',
    bibleReference: 'Isaías 40:31',
    bibleText: 'Mas os que esperam no Senhor renovarão as suas forças; subirão com asas como águias; correrão e não se cansarão; caminharão e não se fatigarão.',
    reflection: 'Cada dia é uma oportunidade de começar de novo. As forças podem faltar, mas quando buscamos renovação em Deus, encontramos energia para seguir em frente.',
    prayer: 'Senhor, renova as minhas forças hoje. Quando o cansaço vier, lembra-me de buscar refreço em Ti. Que eu possa voar como águia, acima das circunstâncias. Amém.',
  },
];

export function getDailyTheme(): DailyTheme {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return dailyThemes[dayOfYear % dailyThemes.length] as DailyTheme;
}
