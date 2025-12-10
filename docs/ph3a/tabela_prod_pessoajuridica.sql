-- Gera dados sinteticos para tabela_prod_pessoajuridica usando ClickHouse.
-- Ajuste row_count, colunas e dominios antes de rodar no servidor.
INSERT INTO tabela_prod_pessoajuridica (
    id,
    cnpj,
    razao_social,
    nome_fantasia,
    email,
    telefone,
    cnae_principal,
    porte,
    cidade,
    uf,
    faturamento_anual,
    numero_funcionarios,
    data_abertura,
    created_at
)
WITH
    toUInt64(4000) AS row_count,
    ['Tech', 'Agro', 'Servicos', 'Logistica', 'Financeira', 'Varejo', 'Educacao', 'Saude', 'Energia', 'Construcoes'] AS company_roots,
    ['LTDA', 'SA', 'Holdings', 'Participacoes', 'Digital'] AS company_suffixes,
    ['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega', 'Prime', 'Core', 'Nova', 'Apex', 'Nimbus'] AS fantasy_roots,
    ['Tecnologia', 'Saude', 'Financeiro', 'Logistica', 'Educacao', 'Energia'] AS segments,
    ['6201500', '6202300', '7319001', '4711301', '6911701', '5229902', '3511500', '8610101'] AS cnaes,
    ['MEI', 'ME', 'EPP', 'LTDA', 'SA'] AS portes,
    ['11', '21', '31', '41', '51', '61', '71', '81', '91'] AS ddds,
    ['Sao Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Salvador', 'Fortaleza', 'Porto Alegre', 'Recife', 'Campinas', 'Goiania'] AS cities,
    ['SP', 'RJ', 'MG', 'PR', 'BA', 'CE', 'RS', 'PE', 'SP', 'GO'] AS ufs,
    ['example.com', 'mail.com', 'contato.com'] AS domains
SELECT
    generateUUIDv4() AS id,
    lpad(toString(10000000000000 + number), 14, '0') AS cnpj,
    concat(
        arrayElement(company_roots, 1 + (number % length(company_roots))),
        ' ',
        arrayElement(company_suffixes, 1 + ((number / length(company_roots)) % length(company_suffixes)))
    ) AS razao_social,
    concat(
        arrayElement(fantasy_roots, 1 + (number % length(fantasy_roots))),
        ' ',
        arrayElement(segments, 1 + ((number / length(fantasy_roots)) % length(segments)))
    ) AS nome_fantasia,
    lower(replaceAll(replaceAll(nome_fantasia, ' ', '-'), '--', '-')) || '@' || arrayElement(domains, 1 + (number % length(domains))) AS email,
    concat('+55', arrayElement(ddds, 1 + (number % length(ddds))), lpad(toString(number % 100000000), 8, '0')) AS telefone,
    arrayElement(cnaes, 1 + (number % length(cnaes))) AS cnae_principal,
    arrayElement(portes, 1 + (number % length(portes))) AS porte,
    arrayElement(cities, 1 + (number % length(cities))) AS cidade,
    arrayElement(ufs, 1 + (number % length(ufs))) AS uf,
    round(500000 + (number % 8000000) + randCanonical() * 250000, 2) AS faturamento_anual,
    toUInt16(5 + (number % 450)) AS numero_funcionarios,
    toDate('2000-01-01') + toIntervalDay(number % 9000) AS data_abertura,
    now() AS created_at
FROM numbers(row_count);
