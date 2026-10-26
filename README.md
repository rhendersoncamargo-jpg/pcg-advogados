# PCG.OS — PCG Advogados

Código exportado do Site https://pcg-os.rhendersoncamargo.chatgpt.site.
Origem: commit 0f83bcbd57474f395fa058156ba739a33fdf747b do repositório de origem do Sites.

## Banco e autenticação

O banco oficial é o Supabase **ldfbippdaydduydjzaac**.
URL: https://ldfbippdaydduydjzaac.supabase.co.
Chaves e credenciais devem ficar nas variáveis de ambiente; não estão neste repositório.
Esta exportação não altera dados, usuários, políticas ou migrations remotas.

## Execução local

1. Execute `npm ci`.
2. Copie `.env.example` para `.env.local` e configure URL/chave publicável do Supabase e as integrações necessárias.
3. Execute `npm run dev`.

## Estado da integração

O código publicado ainda contém adapters e rotas legadas de Firebase/JSON.
A integração completa dessas rotas ao Supabase precisa ser concluída e validada antes de uso real.
Não há configuração Firebase de produção nesta cópia. O módulo legado de Google Auth ainda importa esse arquivo: para compilar sem concluir a migração, copie o exemplo Firebase para o nome local ignorado; isso não habilita a integração.
Não implantar esta exportação automaticamente como uma versão pronta para produção.

## Cuidados da exportação

Foram excluídos o banco JSON, configurações Firebase de produção, histórico Git anterior, artefatos de build e dados de migração.
Foram removidos o bootstrap de usuários com senha padrão, as equipes pessoais iniciais e os eventos demonstrativos.
O manifesto do Sites fica somente no checkout local e está ignorado neste GitHub.
Nenhum deployment é realizado por este repositório.
