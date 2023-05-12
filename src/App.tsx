import { useRef, useState } from 'react';
// import './App.css';
import { Configuration, OpenAIApi } from 'openai';

const OPENAI_API_KEY = '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';

interface IPrompt {
  question: string;
  answer?: string;
}

function App() {
  const configuration = new Configuration({
    apiKey: OPENAI_API_KEY
  });

  const openai = new OpenAIApi(configuration);

  const [storedValues, setStoredValues] = useState<[IPrompt] | []>([]);
  const formRef = useRef<HTMLFormElement>(null);

  function getFormControl(
    form: HTMLFormElement,
    name: string
  ): HTMLInputElement | HTMLSelectElement | HTMLButtonElement {
    const control = form.elements.namedItem(name);
    if (!control || control instanceof RadioNodeList || !('value' in control)) {
      throw new Error(`Form control "${name}" not found or was a RadioNodeList`);
    }
    return control as HTMLInputElement | HTMLSelectElement | HTMLButtonElement;
  }

  const AIOptions = {
    model: 'text-davinci-003',
    temperature: 0,
    max_tokens: 100,
    top_p: 1,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    stop: ['/']
  };

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const inputField = getFormControl(event.currentTarget, 'prompt');

    const completeOptions = {
      ...AIOptions,
      prompt: inputField.value
    };
    const response = await openai.createCompletion(completeOptions);
    if (response.data.choices) {
      setStoredValues([
        {
          question: inputField.value,
          answer: response.data.choices[0].text
        },
        ...(storedValues as [])
      ]);
      formRef.current?.reset();
    }
  };

  const onKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  };

  return (
    <div className="relative container mx-auto h-screen pt-5">
      <h1 className="text-center text-2xl">ChatGPT</h1>
      <div className="group w-full text-white border-b border-gray-900/50 bg-gray-800 py-5 px-2">
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <div className="absolute w-full left-0 bottom-0">
        <form onSubmit={handleSendMessage} ref={formRef}>
          <textarea placeholder="Send a message." name="prompt" onKeyDown={onKeyPress} />
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
}

export default App;
