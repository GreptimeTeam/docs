import type FooterType from '@theme/Footer';
import type {WrapperProps} from '@docusaurus/types';
import React, { useEffect } from 'react';
import Footer from '@theme-original/Footer';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { BielButton } from 'biel-react';
import { defineCustomElements } from 'biel-search/loader';
import 'biel-search/dist/biel-search/biel-search.css';

function BielWidget() {
  const { i18n } = useDocusaurusContext();
  const language = i18n.currentLocale;
  const projectId = process.env.BIEL_PROJECT_ID; // Replace with your actual project ID

  const placeholders = {
      en: {
          bielButtonText: "Ask AI",
          sendButtonText: 'Send',
          inputPlaceholderText: 'Type your message',
          error403: 'Oops! The request URL does not match the one defined for this project.',
          error404: 'Oops! We could not find the provided project ID.',
          errorDefault: 'Oops! Please try again later.',
          headerTitle: 'Need help?',
          footerText: 'AI generated answers. Always verify the sources before using them.',
          sourcesText: 'Sources',
          suggestedQuestions: "['What is Biel.ai?', 'How to install in Docusaurus?']",
          suggestedQuestionsTitle: 'Suggested questions',
          termsTitle: 'Chatbot Terms & Conditions',
          termsDescription: "Please review our <a href='https://biel.ai/terms' target='_blank' rel='noopener'>Terms & Conditions</a> before proceeding.",
          termsCheckboxText: 'I have read and agree to the Terms & Conditions.',
          welcomeMessage: 'Hello! How can I help you today?'
      },
      zh: {
          bielButtonText: "向 AI 提问",
          sendButtonText: '发送',
          inputPlaceholderText: '请输入您的消息',
          footerText: 'AI 生成的答案可能存在错误',
          welcomeMessage: '你好，我是 Greptime AI。你可以问我关于 GreptimeDB 的问题，例如我可以帮助你编写 SQL、Pipeline 或其他与 GreptimeDB 相关的代码。',
      }
  };

  const {
      bielButtonText,
      error403,
      error404,
      errorDefault,
      footerText,
      headerTitle,
      inputPlaceholderText,
      sendButtonText,
      sourcesText,
      suggestedQuestions,
      suggestedQuestionsTitle,
      termsCheckboxText,
      termsDescription,
      termsTitle,
      welcomeMessage,
  } = placeholders[language] || placeholders.en;

  useEffect(() => {
      if (typeof window !== 'undefined') {
          defineCustomElements(window);
      }
  }, []);

  return (
      <div className="biel-widget">
          <BielButton
              project={projectId}
              button-position="bottom-right"
              button-style="dark"
              modal-position="bottom-right"
              error-message-4-0-3={error403}
              error-message-4-0-4={error404}
              error-message-default={errorDefault}
              footer-text={footerText}
              header-title={headerTitle}
              input-placeholder-text={inputPlaceholderText}
              send-button-text={sendButtonText}
              sources-text={sourcesText}
              suggested-questions={suggestedQuestions}
              suggested-questions-title={suggestedQuestionsTitle}
              terms-checkbox-text={termsCheckboxText}
              terms-description={termsDescription}
              terms-title={termsTitle}
              welcome-message={welcomeMessage}
          >
          {bielButtonText}
          </BielButton>
      </div>
  );
}

type Props = WrapperProps<typeof FooterType>;

export default function FooterWrapper(props: Props): JSX.Element {
  return (
    <>
      <Footer {...props} />
      <BielWidget />
    </>
  );
}
