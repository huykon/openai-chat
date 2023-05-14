import { DetailedHTMLProps, TableHTMLAttributes, useRef, useState } from 'react';
import { Configuration, OpenAIApi } from 'openai';
import ReactMarkdown from 'react-markdown';
import { ReactMarkdownProps } from 'react-markdown/lib/complex-types';
import remarkGfm from 'remark-gfm';

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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
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

  const handleSendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    const inputField = getFormControl(event.currentTarget, 'prompt');

    setIsSubmitting(true);
    try {
      const response = await openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: inputField.value }]
      });

      if (response.data.choices) {
        setStoredValues([
          ...(storedValues as []),
          {
            question: inputField.value,
            answer: response.data.choices[0].message?.content
          }
        ]);
        formRef.current?.reset();
      }
      setIsSubmitting(false);
    } catch (error) {
      setIsSubmitting(false);
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
      <div className="group w-full text-white border-b border-gray-900/50 bg-gray-800 py-5 mt-2 overflow-y-auto max-h-[calc(100vh-147px)]">
        {storedValues.length < 1 ? (
          <p className="px-2">
            I am an automated question and answer system, designed to assist you in finding relevant
            information. You are welcome to ask me any queries you may have, and I will do my utmost
            to offer you a reliable response. Kindly keep in mind that I am a machine and operate
            solely based on programmed algorithms.
          </p>
        ) : (
          storedValues.map((value, index) => {
            return (
              <div key={index}>
                <div className="group w-full text-gray-100 border-b border-gray-900/50 bg-gray-800 px-2 py-5">
                  <b>You:</b> {value.question}
                </div>
                <div className="group w-full text-gray-100 border-b border-gray-900/50 bg-[#444654] px-2 py-5">
                  <b>Bot:</b>
                  <ReactMarkdown
                    children={value.answer as string}
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: CustomTable
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="absolute w-full left-0 bottom-5">
        <form onSubmit={handleSendMessage} ref={formRef} className="relative">
          <div className="flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]">
            <textarea
              placeholder="Send a message."
              rows={1}
              className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent pl-2 md:pl-0 outline-0"
              onKeyDown={onKeyPress}
              name="prompt"
            />
            <button
              disabled={isSubmitting}
              className="absolute p-1 rounded-md text-gray-500 bottom-1.5 md:bottom-2.5 hover:bg-gray-100 enabled:dark:hover:text-gray-400 dark:hover:bg-gray-900 disabled:hover:bg-transparent dark:disabled:hover:bg-transparent right-1 md:right-2 disabled:opacity-40">
              <svg
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4 mr-1"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;

// This lets us style any markdown tables that are rendered
const CustomTable: React.FC<
  Omit<DetailedHTMLProps<TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>, 'ref'> &
    ReactMarkdownProps
> = ({ children, ...props }) => {
  return (
    <div className="overflow-x-auto">
      <table {...props} className="w-full text-left border-collapse table-auto">
        {children}
      </table>
    </div>
  );
};
