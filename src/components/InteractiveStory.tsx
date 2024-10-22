import { useState } from 'react';

// Define types for our data structure
type Option = string;

type StoryPart = {
  parte: number;
  descripcion: string;
  opciones: Option[];
};

type Story = {
  titulo: string;
  partes: StoryPart[];
  final: string;
};

type StoriesData = {
  historias: Story[];
};

// Our component props
type InteractiveStoryProps = {
  data: StoriesData;
};

export default function InteractiveStory({ data }: InteractiveStoryProps) {
  const [currentStory, setCurrentStory] = useState<number>(0);
  const [currentPart, setCurrentPart] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const story = data.historias[currentStory];

  const handleChoice = () => {
    if (currentPart < story.partes.length - 1) {
      setCurrentPart(currentPart + 1);
    } else {
      setIsFinished(true);
    }
  };

  const restartStory = () => {
    setCurrentPart(0);
    setIsFinished(false);
  };

  const changeStory = (index: number) => {
    setCurrentStory(index);
    setCurrentPart(0);
    setIsFinished(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{story.titulo}</h1>
      {!isFinished ? (
        <div>
          <p className="mb-4">{story.partes[currentPart].descripcion}</p>
          <div className="space-y-2">
            {story.partes[currentPart].opciones.map((option, index) => (
              <button
                key={index}
                onClick={() => handleChoice()}
                className="w-full p-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p className="mb-4">{story.final}</p>
          <button
            onClick={restartStory}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reiniciar historia
          </button>
        </div>
      )}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Otras historias:</h2>
        <div className="flex flex-wrap gap-2">
          {data.historias.map((s, index) => (
            <button
              key={index}
              onClick={() => changeStory(index)}
              className="p-2 bg-gray-200 hover:bg-gray-300 rounded"
            >
              {s.titulo}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}