import { getCurrent, onOpenUrl } from "@tauri-apps/plugin-deep-link";

export async function setupDeepLinkListener() {
/*   await listen("deep-link-received", (event) => {
    console.log("Deep link reçu via événement Rust (Linux) :", event.payload);
    alert("Événement Rust reçu en JS ! Payload : " + event.payload);
    traiterUrl(event.payload as string);
  }); */
  const initialUrls = await getCurrent();
  if (initialUrls && initialUrls.length > 0) {
    console.log("App démarrée via deep link (initial) :", initialUrls);
    // alert("App : " + initialUrls.join(" "));
    traiterUrl(initialUrls[0]);
  }

  await onOpenUrl((urls) => {
    console.log("Deep link intercepté par le plugin :", urls);
    // alert("Deep Link : " + urls.join(" "));
    if (urls.length > 0) traiterUrl(urls[0]);
  });
}

function traiterUrl(urlStr: string) {
  try {
    const url = new URL(urlStr);

    if (url.host === 'oauth-callback' || url.pathname.includes('oauth-callback')) {
      const code = url.searchParams.get('code');
      console.log("Code Authentik intercepté avec succès ! Code :", code);
      // alert("Code Authentik trouvé : " + code);
    }
  } catch (e) {
    console.error("Erreur lors du parsing de l'URL :", urlStr, e);
  }
}