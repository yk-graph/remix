# Welcome to Remix!

- [Remix Docs](https://remix.run/docs)

## Remix が提供しているメソッドやコンポーネント

### @remix-run/node : Remix で用意されている型定義やメソッドを呼び出せる

#### 型

- LinksFunction
  - Remix アプリケーションでルートモジュールに関連するリンクタグ（主に CSS スタイルシート）を定義するための関数の型
- LoaderFunctionArgs
  - Remix のローダー関数に渡される引数の型
  - ローダー関数は、ルートのデータを非同期に取得するために使用される
- ActionFunctionArgs
  - Remix のアクション関数に渡される引数の型
  - アクション関数は主に POST、PUT、DELETE などの非 GET リクエストを処理するために使用される

#### メソッド

- json
  - JavaScript オブジェクトを JSON 形式のレスポンスに変換する Remix が独自に定義したメソッド
  - 自動的に適切な Content-Type ヘッダー（application/json）を設定する
  - オプションでステータスコードやヘッダーを指定可能
- redirect
  - HTTP リダイレクトレスポンスを生成
  - デフォルトで 302（一時的リダイレクト）のステータスコードを使用
  - オプションでステータスコードやヘッダーを指定可能

### @remix-run/react : Remix で用意されているコンポーネントが呼び出せる

- Form : HTML 標準の<form>要素をラップし、Remix の機能と統合するために使用されるコンポーネント
- Link : React Router の Link コンポーネントを拡張し、Remix 特有の機能を追加しクライアントサイドのナビゲーションを可能にするコンポーネント
  - to: リンク先の URL を指定します（必須）。
  - prefetch: リンク先のデータをプリフェッチする方法を指定します（"intent"、"render"、"none"）。
  - reloadDocument: true の場合、通常のページ遷移（フルリロード）を行います。
  - preventScrollReset: true の場合、ページ遷移時のスクロール位置のリセットを防ぎます。
- Links : アプリケーションのヘッダーに動的にリンクタグを追加するために使用されるコンポーネント。主に CSS スタイルシートの管理に使用される
- Meta : ページのメタデータを動的に管理するために使用されるコンポーネント
- NavLink : ナビゲーションメニューやタブなどの UI 要素で使用されるコンポーネント
  - isActive : 現在の URL が NavLink の to 属性で指定されたパスと一致しているかどうかを示すブール値
  - isPending : リンク先のページがロード中であることを示します | ローディング状態のスタイルを適用する際に使用します。
  - isTransitioning : 現在のページからリンク先のページへ遷移中であることを示します | 遷移アニメーションなどを制御する際に使用します。
- Outlet : ネストされたルーティング構造を実現するために使用されるコンポーネント
  - ネストされたルートのレンダリング： 親ルートのレイアウト内で子ルートのコンテンツを表示するためのプレースホルダーとして機能します。
  - レイアウトの再利用： 共通のレイアウト要素を親ルートに定義し、Outlet を通じて子ルートの内容を挿入できます。
  - 動的なコンテンツ切り替え： ユーザーがナビゲートする際に、Outlet 内のコンテンツのみが更新されます。
- Scripts : Remix アプリケーションで必要な JavaScript ファイルを適切にロードするために使用される重要なコンポーネント
  - 配置場所： </body>タグの直前に配置。これにより、HTML コンテンツが先にレンダリングされ、その後で JavaScript が読み込まれる
- ScrollRestoration : ページ間のスクロール位置を管理するために使用されるコンポーネント
  - 配置場所： <Scripts />コンポーネントの直前に配置

## loader について

- データを取得するために必要な処理で、コンポーネント内で定義する
- サーバーサイド実行： loader はサーバーサイドで実行され、そのデータはクライアントに送信される
- ルート固有： 各ルートファイル（例：app/routes/users.tsx）で定義され、そのルートに特化したデータを取得する
- HTTP メソッド： 通常、GET リクエストに対応する（非 GET リクエストは action で処理）
- パラメータアクセス： URL パラメータ、クエリパラメータ、およびリクエスト情報にアクセスが可能

### useLoaderData について

- Remix 独自の React hook
- loader で返されたデータをコンポーネント内で取得するために使用される
- 型安全性： TypeScript と組み合わせて使用すると、loader が返すデータの型を正確に推論できる
- 具体： `const { products } = useLoaderData<typeof loader>();`
- 自動的なデータ取得： ルートがロードされると、対応する loader のデータが自動的に取得され、この hook を通じて利用可能になる
- コンポーネント内での使用： ルートコンポーネントだけでなく、そのルート内の任意の子コンポーネントでも使用が可能
- リアクティブ更新： loader のデータが更新されると、useLoaderData を使用しているコンポーネントも自動的に再レンダリングされる

### 使用例

基本

```
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

export const loader: LoaderFunction = async ({ params, request }) => {
  const userId = params.userId;
  const user = await getUser(userId);
  return json({ user });
};

export default function UserProfile() {
  const { user } = useLoaderData<typeof loader>();
  return <div>Hello, {user.name}!</div>;
}
```

エラーハンドリング

```
export const loader: LoaderFunction = async ({ params }) => {
  const post = await getPost(params.slug);
  if (!post) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ post });
};
```

ネストされたデータ取得（Promise.all）

```
export const loader: LoaderFunction = async ({ params }) => {
  const [user, posts] = await Promise.all([
    getUser(params.userId),
    getUserPosts(params.userId)
  ]);
  return json({ user, posts });
};
```

クエリパラメータの使用

```
export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const searchTerm = url.searchParams.get("q");
  const results = await searchProducts(searchTerm);
  return json({ results });
};
```

## action について

- Remix アプリケーションでデータの変更や副作用を伴う操作を処理するための非同期関数
- 主に POST、PUT、DELETE、PATCH などの非 GET リクエストを処理する
- Remix では 1 つのコンポーネント（ルート）に対して 1 つの action 関数しか定義できない
- サーバーサイド実行： Action はサーバーサイドで実行されるため、データベース操作や API コールなどを安全に行える
- ルート固有： 各ルートファイルで定義され、そのルートに特化したデータ変更操作を処理を行う
- フォーム送信処理： 主に HTML フォームの送信や JavaScript によるフォームデータの送信を処理を行う
- リダイレクトとデータ返却： 処理後にリダイレクトしたり、更新されたデータを返したりする処理を記述して指定できる

### ActionFunction | ActionFunctionArgs について

- ActionFunction は関数全体の型を定義 `export const action: ActionFunction = async ({ request, params, context }) => {}`
- ActionFunctionArgs は関数に渡される引数の型を定義 `export const action = async ({ request, params, context }: ActionFunctionArgs) => {}`
  - request : Web 標準の Request オブジェクト
    - URL や HTTP メソッド、ヘッダーなどのリクエスト情報にアクセスできる
    - フォームデータや JSON ボディを取得するためのメソッドを提供される
  - params : ルートパラメータを含むオブジェクト
    - 動的セグメントの値にアクセスできる const { userId, postId } = params;
  - context : アプリケーション全体で共有されるコンテキストオブジェクト
    - サーバーサイドでのみ利用可能な情報を含めることが可能
    - アプリケーション起動時に設定され、全ての loader と action で利用可能
    - データベース接続、認証情報、環境変数などを含めることが一般的 const { db, env } = context;

基本

```
import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name");
  const email = formData.get("email");

  await createUser({ name, email });

  return redirect("/users");
};

export default function CreateUser() {
  return (
    <Form method="post">
      <input name="name" type="text" />
      <input name="email" type="email" />
      <button type="submit">Create User</button>
    </Form>
  );
}
```

バリデーションとエラーハンドリング

```
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");

  if (!isValidEmail(email)) {
    return json({ errors: { email: "Invalid email address" } }, { status: 400 });
  }

  await updateUserEmail(email);
  return redirect("/profile");
};
```

複数のアクションタイプの処理

```
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get("_action");

  async function handleCreate(formData: FormData) {
    // POST処理のロジック
  }

  async function handleUpdate(formData: FormData) {
    // PATCH処理のロジック
  }

  async function handleDelete(formData: FormData) {
    // DELETE処理のロジック
  }

  switch (actionType) {
    case "create":
      return handleCreate(formData);
    case "update":
      return handleUpdate(formData);
    case "delete":
      return handleDelete(formData);
    default:
      return json({ error: "Invalid action" }, { status: 400 });
  }
};
```

ファイルアップロード処理

```
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const file = formData.get("avatar") as File;

  if (file.size > 1000000) {
    return json({ error: "File too large" }, { status: 400 });
  }

  const uploadResult = await uploadFile(file);
  return json({ success: true, fileUrl: uploadResult.url });
};
```

## Remix の独自の Hooks について

### useLoaderData

- Loader で返されたデータをコンポーネント内で取得するために使用される
- 型安全性： TypeScript と組み合わせて使用すると、loader が返すデータの型を正確に推論できる
  - 具体 -> `<typeof loader>` で型を付ける ： `const { products } = useLoaderData<typeof loader>();`
- 自動的なデータ取得： ルートがロードされると、対応する loader のデータが自動的に取得され、この hook を通じて利用可能になる
- コンポーネント内での使用： ルートコンポーネントだけでなく、そのルート内の任意の子コンポーネントでも使用が可能
- リアクティブ更新： loader のデータが更新されると、useLoaderData を使用しているコンポーネントも自動的に再レンダリングされる

### useNavigation

`const navigation = useNavigation();`

- 現在のナビゲーション状態を追跡するための React hook
- ナビゲーション状態の追跡： 現在のナビゲーションの状態（idle、loading、submitting）を提供する
- 進行中のナビゲーション情報： ロード中または送信中のフォームに関する詳細情報を提供する

#### useNavigation が返すオブジェクトの主なプロパティ

- state: 現在のナビゲーション状態
  - "idle": ナビゲーションが進行中でない
  - "loading": データをロード中
  - "submitting": フォームを送信中
- location: 進行中のナビゲーションの目的地（存在する場合）| ナビゲーションが進行中でない（つまり、navigation.state === "idle"）場合、location オブジェクトは通常 undefined になる
- formData: 送信中のフォームデータ（存在する場合）
- formAction: 送信中のフォームのアクション（存在する場合）
- formMethod: 送信中のフォームの HTTP メソッド（存在する場合）

#### location のプロパティ

- pathname: string
  - URL のパス部分を表します 例: "/users/profile"
- search: string
  - URL のクエリ文字列部分を表します（?を含む） 例: "?id=123&sort=asc"
- hash: string
  - URL のハッシュ部分を表します（#を含む） 例: "#section1"

#### クエリパラメーターを取得する方法

`new URLSearchParams(navigation.location.search);`

```
function QueryParamsExample() {
  const navigation = useNavigation();

  if (navigation.state === "idle") return null;

  const searchParams = new URLSearchParams(navigation.location.search);

  return (
    <div>
      <p>Query Parameters:</p>
      <ul>
        {Array.from(searchParams.entries()).map(([key, value]) => (
          <li key={key}>{key}: {value}</li>
        ))}
      </ul>
    </div>
  );
}
```
