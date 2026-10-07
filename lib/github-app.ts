import { importPKCS8, SignJWT } from "jose";

const apiBase = "https://api.github.com";
const appId = process.env.GITHUB_APP_ID;
const clientId = process.env.GITHUB_CLIENT_ID;
const privateKey = process.env.GITHUB_PRIVATE_KEY;
const installationOwner = process.env.GITHUB_INSTALLATION_OWNER ?? "HarithaKongi";

function githubHeaders(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2026-03-10",
  };
}

async function createAppJwt() {
  if (!appId || !privateKey) {
    throw new Error("GitHub App credentials are not configured");
  }

  const normalizedKey = privateKey.replace(/\\n/g, "\n");
  const key = await importPKCS8(normalizedKey, "RS256");
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({})
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(clientId || appId)
    .setIssuedAt(now - 60)
    .setExpirationTime(now + 540)
    .sign(key);
}

export async function getInstallationToken() {
  const jwt = await createAppJwt();

  const installationResponse = await fetch(
    `${apiBase}/users/${encodeURIComponent(installationOwner)}/installation`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${jwt}`,
        "X-GitHub-Api-Version": "2026-03-10",
      },
      cache: "no-store",
    },
  );

  if (!installationResponse.ok) {
    throw new Error(`GitHub App installation lookup failed: ${installationResponse.status}`);
  }

  const installation = await installationResponse.json();

  const tokenResponse = await fetch(
    `${apiBase}/app/installations/${installation.id}/access_tokens`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${jwt}`,
        "X-GitHub-Api-Version": "2026-03-10",
      },
      cache: "no-store",
    },
  );

  if (!tokenResponse.ok) {
    throw new Error(`GitHub App token creation failed: ${tokenResponse.status}`);
  }

  const token = await tokenResponse.json();
  return {
    accessToken: token.token as string,
    expiresAt: token.expires_at as string,
    installationId: installation.id as number,
  };
}

export async function githubAppFetch(path: string, init?: RequestInit) {
  const { accessToken } = await getInstallationToken();
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: {
      ...githubHeaders(accessToken),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`GitHub API request failed: ${response.status}`);
  }

  return response;
}
