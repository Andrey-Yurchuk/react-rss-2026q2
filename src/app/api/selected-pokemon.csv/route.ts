import { validateCsvPayload } from './validation.ts';

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { error: 'Invalid JSON payload.' },
      { status: 400 }
    );
  }

  const validation = validateCsvPayload(payload);
  if (!validation.ok) {
    return Response.json({ error: validation.message }, { status: 400 });
  }

  return new Response(validation.csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${validation.filename}"`,
    },
  });
}
