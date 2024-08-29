/*
	[Tips] 削除処理するときのページファイル -> 削除ボタン自体は以下のように指定する
		<Form action="destroy" method="post" ...> ... </Form>
		action に対して destroy を指定する
*/

import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import invariant from "tiny-invariant";

import { deleteContact } from "../data";

export const action = async ({ params }: ActionFunctionArgs) => {
  invariant(params.contactId, "Missing contactId param");
  await deleteContact(params.contactId);
  return redirect("/");
};
