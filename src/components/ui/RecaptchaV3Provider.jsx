import { createContext, useContext } from 'react';
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from 'react-google-recaptcha-v3';

const RECAPTCHA_V3_SITE_KEY = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY;

/**
 * reCAPTCHA v3 Context — provides executeRecaptcha hook for Login & Register.
 *
 * reCAPTCHA v3 berjalan secara invisible (tidak ada interaksi user),
 * mengembalikan skor 0.0–1.0 (1.0 = manusia, 0.0 = bot).
 *
 * Usage di komponen child:
 *   const { executeRecaptcha } = useRecaptchaV3();
 *   const token = await executeRecaptcha('login'); // atau 'register'
 */

// Internal context to expose executeRecaptcha
const RecaptchaV3Context = createContext({ executeRecaptcha: null });

function RecaptchaV3Inner({ children }) {
  const { executeRecaptcha } = useGoogleReCaptcha();
  return (
    <RecaptchaV3Context.Provider value={{ executeRecaptcha }}>
      {children}
    </RecaptchaV3Context.Provider>
  );
}

/**
 * Wrap your app (atau bagian auth) dengan provider ini.
 * Sudah dipasang di main.jsx.
 */
export function RecaptchaV3Provider({ children }) {
  if (!RECAPTCHA_V3_SITE_KEY) {
    console.warn('[RecaptchaV3] VITE_RECAPTCHA_V3_SITE_KEY belum diatur. reCAPTCHA v3 dinonaktifkan.');
    return (
      <RecaptchaV3Context.Provider value={{ executeRecaptcha: null }}>
        {children}
      </RecaptchaV3Context.Provider>
    );
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_V3_SITE_KEY}
      language="id"
      scriptProps={{ async: true, defer: true }}
    >
      <RecaptchaV3Inner>{children}</RecaptchaV3Inner>
    </GoogleReCaptchaProvider>
  );
}

/**
 * Hook untuk mendapatkan executeRecaptcha dari mana saja di dalam provider.
 *
 * @returns {{ executeRecaptcha: ((action: string) => Promise<string>) | null }}
 */
export function useRecaptchaV3() {
  return useContext(RecaptchaV3Context);
}
