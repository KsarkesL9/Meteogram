const READING_GUIDE = [
  'Kliknij punkt na mapie — panel po prawej pokaże prognozy wszystkich modeli dla tego miejsca.',
  'Suwak czasu pod mapą synchronizuje warstwę na mapie i kursor na wykresie; przycisk ▶ odtwarza prognozę w pętli.',
  'Checkboxy w legendzie wykluczają model z wykresu i natychmiast przeliczają średnią.',
  'Szara ikona modelu oznacza, że model nie dostarcza danych dla tej lokalizacji lub parametru.',
];

// FR-25: the glossary mirrors section 2 of the FSD word for word
const GLOSSARY: { term: string; definition: string }[] = [
  {
    term: 'Model numeryczny (NWP)',
    definition:
      'Program komputerowy symulujący fizykę atmosfery w celu przewidzenia przyszłego stanu pogody',
  },
  {
    term: 'Run modelu',
    definition:
      'Pojedyncze uruchomienie modelu, inicjalizowane cyklicznie na podstawie najnowszych pomiarów (np. co 6 godzin)',
  },
  {
    term: 'Best match / Seamless',
    definition:
      'Sposób, w jaki dane od jednego dostawcy są automatycznie łączone w jedną, ciągłą serię czasową z kilku jego modeli o różnej rozdzielczości i zasięgu',
  },
  {
    term: 'Rozdzielczość przestrzenna modelu',
    definition:
      'Wielkość pojedynczej komórki siatki obliczeniowej modelu; mniejsza komórka oznacza dokładniejszy, ale zwykle węższy geograficznie model',
  },
  {
    term: 'Horyzont prognozy',
    definition:
      'Maksymalna liczba dni w przód, na jaką dany model dostarcza dane',
  },
  {
    term: 'Multi-model average',
    definition:
      'Średnia arytmetyczna wartości ze wszystkich aktywnych (niewykluczonych) modeli w danym punkcie czasu',
  },
  {
    term: 'MSLP',
    definition:
      'Mean Sea Level Pressure — ciśnienie atmosferyczne zredukowane do poziomu morza, standardowa wielkość używana do porównań między lokalizacjami o różnej wysokości',
  },
  {
    term: 'CAPE',
    definition:
      'Convective Available Potential Energy — miara energii dostępnej dla wznoszącego się powietrza; wyższe wartości oznaczają większy potencjał do rozwoju silnej konwekcji (burz)',
  },
  {
    term: 'CIN',
    definition:
      'Convective Inhibition — miara energii hamującej wznoszenie powietrza; wysokie CIN utrudnia zainicjowanie konwekcji nawet przy wysokim CAPE',
  },
  {
    term: 'Punkt rosy',
    definition:
      'Temperatura, do której trzeba schłodzić powietrze, aby zaszła kondensacja pary wodnej; wysoki punkt rosy oznacza powietrze odczuwane jako duszne',
  },
  {
    term: 'Wilgotność względna',
    definition:
      'Stosunek ilości pary wodnej zawartej w powietrzu do maksymalnej ilości, jaką powietrze może utrzymać w danej temperaturze',
  },
  {
    term: 'Zachmurzenie niskie / średnie / wysokie',
    definition:
      'Podział chmur według wysokości podstawy nad ziemią; wpływa inaczej na widoczność, opad i nasłonecznienie',
  },
  {
    term: 'Porywy wiatru',
    definition:
      'Krótkotrwałe, gwałtowne zwiększenie prędkości wiatru ponad wartość średnią',
  },
  {
    term: 'Poziom zamarzania',
    definition:
      'Wysokość nad poziomem morza, na której temperatura powietrza spada do 0°C; istotny przy rozróżnianiu opadu deszczu od śniegu',
  },
  {
    term: 'Zasięg regionalny',
    definition:
      'Obszar geograficzny, dla którego dany model dostarcza dane (np. HRRR wyłącznie USA)',
  },
];

interface HelpModalProps {
  onClose: () => void;
}

export function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-[640px] flex-col rounded border border-line-strong bg-panel shadow-lg"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 className="text-lg font-bold">Pomoc</h2>
          <button
            type="button"
            className="px-2 text-ink-muted hover:text-ink"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div className="min-h-0 grow overflow-y-auto px-4 py-3 text-sm">
          <h3 className="mb-2 font-bold">Jak czytać Meteogram</h3>
          <ul className="mb-4 list-disc pl-5">
            {READING_GUIDE.map((entry) => (
              <li key={entry} className="mb-1">
                {entry}
              </li>
            ))}
          </ul>
          <h3 className="mb-2 font-bold">Słowniczek pojęć</h3>
          <table className="w-full border-collapse">
            <tbody>
              {GLOSSARY.map(({ term, definition }) => (
                <tr key={term} className="border-t border-line align-top">
                  <td className="w-44 py-1.5 pr-3 font-bold">{term}</td>
                  <td className="py-1.5 text-ink-secondary">{definition}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line px-4 py-3 text-right">
          <button
            type="button"
            className="rounded border border-line-strong bg-header-light px-4 py-1.5 text-sm hover:bg-line"
            onClick={onClose}
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
