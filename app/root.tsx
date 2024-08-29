import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useEffect } from "react";

import {
  Form,
  // Link, // [Tips] clientSideRoutingするために必要なコンポーネント
  Links,
  Meta,
  NavLink, // [Tips] アクティブと保留の状態をスタイリングするための追加プロップで <Link> をラップできる | https://remix.run/docs/en/main/components/nav-link
  Outlet, // [Tips] この指定がないとネストされたページで要素が表示されない | 親ルートと一致する子ルートをレンダリングする | https://remix.run/docs/en/main/components/outlet#outlet
  Scripts,
  ScrollRestoration, // [Tips] ローダが完了した後の位置変更時のブラウザのスクロール復元される | スクロール位置が適切な場所に適切なタイミングで復元される | https://remix.run/docs/en/main/components/scroll-restoration
  useLoaderData,
  useNavigation, // [Tips] ページ遷移やデータを再取得するまでの間のstatusを取得できるhooks | https://remix.run/docs/en/main/hooks/use-navigation
  useSubmit, // [Tips] input type="search" や type="submit" などの挙動で動作が発火させるのではなく、指定したイベントが起きたときにフォームを送信するための関数
} from "@remix-run/react";

// Styleのimport
import appStylesHref from "./app.css?url";
// mockのダミーデータに対してデータを取得・新規作成するための関数
import { createEmptyContact, getContacts } from "./data";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

// [Tips] データをFetchする方法 | データをロードするために使うAPIはloaderとuseLoaderDataの2つ
// 1 ルートにloader関数を作成してエクスポートしデータをレンダリングする
// 2 app/root.tsxからloader関数をエクスポートしてuseLoaderDataのhooksを使ってデータをレンダリングする
export const loader = async ({ request }: LoaderFunctionArgs) => {
  // [Tips] queryParamaterから検索をする方法 | new URL(request.url)を使ってURLオブジェクトを取得 -> searchParams.getメソッドを使ってquery stringを取得する
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  return json({ contacts, q });
};

// [Tips] データをPOSTする方法
export const action = async () => {
  const contact = await createEmptyContact();
  // [Tips] redirectメソッド | https://remix.run/docs/en/main/utils/redirect
  return redirect(`/contacts/${contact.id}/edit`);
};

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();

  const searching =
    navigation.location && //
    new URLSearchParams(navigation.location.search).has("q"); // [Tips] navigation.location.search と指定することでクエリパラメータが取得できる

  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
  }, [q]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <Form
              id="search-form"
              // [Tips] event.currentTargetを渡すことで、イベントがアタッチされているDOMノード（フォーム）を渡すことになる
              onChange={(event) => {
                const isFirstSearch = q === null;
                submit(event.currentTarget, {
                  replace: !isFirstSearch, // [Tips] ブラウザの履歴スタックをクリーンに保つ方法 | https://remix.run/docs/en/main/start/tutorial#managing-the-history-stack
                });
              }} // onChangeがされるたびにフォームにリクエストがされるための挙動
              role="search"
            >
              <input
                id="q"
                className={searching ? "loading" : ""}
                defaultValue={q || ""}
                aria-label="Search contacts"
                placeholder="Search"
                type="search" // [Tips] typeにsearchが指定されているので、QueryParameterに指定した文字列が入りGETリクエストが発生する
                name="q"
              />
              <div id="search-spinner" aria-hidden hidden={!searching} />
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <NavLink
                      className={({ isActive, isPending }) =>
                        isActive ? "active" : isPending ? "pending" : ""
                      }
                      to={`contacts/${contact.id}`}
                    >
                      {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        <i>No Name</i>
                      )}{" "}
                      {contact.favorite ? <span>★</span> : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>

        <div id="detail">
          {/* [Tips] useNavigationを使って、Outletで描画するページの情報のstatusを取得してCSSで描画を出し分ける方法 */}
          <div
            className={
              navigation.state === "loading" && !searching ? "loading" : ""
            }
            id="detail"
          >
            <Outlet />
          </div>
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
