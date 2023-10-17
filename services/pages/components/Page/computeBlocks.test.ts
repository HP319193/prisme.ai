import {
  computeBlocks,
  interpolate,
  interpolateExpression,
  repeatBlocks,
  testCondition,
} from './computeBlocks';

it('should display conditionally', () => {
  expect(
    testCondition('{{test}}', {
      test: true,
    })
  ).toBeTruthy();
  expect(
    testCondition('!{{test}}', {
      test: true,
    })
  ).toBeFalsy();
  expect(
    testCondition('{{test}}', {
      test: false,
    })
  ).toBeFalsy();
  expect(
    testCondition('!{{test}}', {
      test: false,
    })
  ).toBeTruthy();
  expect(testCondition('{{test}}', {})).toBeFalsy();
  expect(testCondition('!{{test}}', {})).toBeTruthy();
  expect(testCondition('true', {})).toBeTruthy();
  expect(testCondition('!true', {})).toBeFalsy();
  expect(testCondition('false', {})).toBeFalsy();
  expect(testCondition('!false', {})).toBeTruthy();

  expect(
    testCondition('!{{currentFile}}', {
      currentFile: {
        id: '695e602e5398485c90b3da84ad44a84d',
        name: '',
        status: 'published',
        updatedAt: '2023-09-01T13:28:11.492Z',
        text: '',
        tokens: 1384,
      },
    })
  ).toBeFalsy();
});

it('should interpolate expression', () => {
  expect(interpolateExpression('{{foo}}', { foo: 'Foo' })).toBe('Foo');
  expect(
    interpolateExpression('{{foo}} {{bar}}', { foo: 'Foo', bar: 'Bar' })
  ).toBe('Foo Bar');
  expect(interpolateExpression('{{foo}} {{bar}}', {})).toBe(' ');
});

it('should interpolate object', () => {
  expect(
    interpolate(
      {
        blocks: [
          {
            slug: 'RichText',
            content: '{{Untouched}}',
          },
        ],
        stringValue: '{{string}}',
        objectValue: {
          foo: '{{object.foo}}',
          bar: '{{object.bar}}',
        },
        arrayValue: [
          '{{array}}',
          {
            label: '{{array}}',
          },
        ],
      },
      {
        string: 'StringValue',
        object: {
          foo: 'Foo',
          bar: 'Bar',
        },
        array: 'array',
      }
    )
  ).toEqual({
    blocks: [
      {
        slug: 'RichText',
        content: '{{Untouched}}',
      },
    ],
    stringValue: 'StringValue',
    objectValue: {
      foo: 'Foo',
      bar: 'Bar',
    },
    arrayValue: [
      'array',
      {
        label: 'array',
      },
    ],
  });
});

it('should repeat blocks', () => {
  expect(
    repeatBlocks(
      {
        content: '{{item}}',
      },
      {
        on: '{{items}}',
      },
      {
        items: ['foo', 'bar'],
      }
    )
  ).toEqual([
    {
      content: 'foo',
      item: 'foo',
      $index: 0,
    },
    {
      content: 'bar',
      item: 'bar',
      $index: 1,
    },
  ]);

  expect(
    repeatBlocks(
      {
        content: '{{truc.label}}',
      },
      {
        on: '{{items}}',
        as: 'truc',
      },
      {
        items: [{ label: 'foo' }, { label: 'bar' }],
      }
    )
  ).toEqual([
    {
      content: 'foo',
      truc: { label: 'foo' },
      $index: 0,
    },
    {
      content: 'bar',
      truc: { label: 'bar' },
      $index: 1,
    },
  ]);
});

it('should compute blocks', () => {
  expect(
    computeBlocks(
      {
        blocks: [
          {
            slug: 'RichText',
            content: 'Visible',
            'template.if': '{{world}}',
          },
          {
            slug: 'RichText',
            content: 'Hidden',
            'template.if': '!{{world}}',
          },
        ],
        content: 'Hello {{world}}',
      },
      {
        world: 'World',
      }
    )
  ).toEqual({
    blocks: [
      {
        slug: 'RichText',
        content: 'Visible',
      },
    ],
    content: 'Hello World',
  });
});

it('should interpolate expression with filters', () => {
  expect(
    interpolateExpression("{{foo|date:'LL'}}", {
      foo: 'Tue, 11 Jul 2023 07:09:57 GMT',
    })
  ).toBe('July 11, 2023');
  expect(
    interpolateExpression("{{foo|date:'LL',lang}}", {
      foo: 'Tue, 11 Jul 2023 07:09:57 GMT',
      lang: 'fr',
    })
  ).toBe('11 juillet 2023');
  expect(
    interpolateExpression("{{foo|date:'LL', lang }}", {
      foo: 'Tue, 11 Jul 2023 07:09:57 GMT',
      lang: 'fr',
    })
  ).toBe('11 juillet 2023');

  expect(
    interpolateExpression('{{foo|from-now}}', {
      foo: new Date(Date.now() - 1000 * 60 * 60),
    })
  ).toBe('an hour ago');
  expect(
    interpolateExpression('{{foo|from-now:"fr"}}', {
      foo: new Date(Date.now() - 1000 * 60 * 60),
    })
  ).toBe('il y a une heure');

  expect(
    interpolateExpression("{{foo|if:'foo','bar'}}", {
      foo: true,
    })
  ).toBe('foo');
  expect(
    interpolateExpression("{{foo|if:'foo','bar'}}", {
      foo: false,
    })
  ).toBe('bar');
  expect(
    interpolateExpression('{{ foo | if : foo, bar }}', {
      foo: 'FOO',
      bar: 'BAR',
    })
  ).toBe('FOO');
});

it('should not read self value', () => {
  expect(
    computeBlocks(
      {
        slug: 'RichText',
        content: '{{content}}',
      },
      {
        content: 'Foo',
      }
    )
  ).toEqual({
    blocks: undefined,
    slug: 'RichText',
    content: 'Foo',
  });
});

it('should read self value', () => {
  expect(
    computeBlocks(
      {
        slug: 'RichText',
        content: '{{foo}}',
        foo: 'Foo',
      },
      {}
    )
  ).toEqual({
    blocks: undefined,
    slug: 'RichText',
    content: 'Foo',
    foo: 'Foo',
  });
});

it('should interpolate an array', () => {
  expect(
    computeBlocks(
      {
        slug: 'Carousel',
        images: '{{images}}',
      },
      {
        images: ['Foo'],
      }
    )
  ).toEqual({
    blocks: undefined,
    slug: 'Carousel',
    images: ['Foo'],
  });
});

it('should not create a new array', () => {
  const from = {
    foo: [],
  };
  const to = computeBlocks(from, {});
  expect(from.foo).toBe(to.foo);
});

it('should not create a new object', () => {
  const from = {
    foo: {},
  };
  const to = computeBlocks(from, {});
  expect(from.foo).toBe(to.foo);
});

it('should interpolate arrays', () => {
  const from = {
    array: [['val1', '{{replace}}']],
  };
  const to = computeBlocks(from, {
    replace: 'val2',
  });
  expect(to.array).toEqual([['val1', 'val2']]);
});

it('should not create new array', () => {
  const from = {
    array: [['val1', 'val2']],
  };
  const to = computeBlocks(from, {});
  expect(from.array).toBe(to.array);
  expect(from.array).toEqual([['val1', 'val2']]);
});

it('should interpolate booleans', () => {
  const from = {
    boolean: '{{bool}}',
  };
  const to = computeBlocks(from, { bool: true });

  expect(computeBlocks(from, { bool: true }).boolean).toBe(true);
  expect(computeBlocks(from, { bool: false }).boolean).toBe(false);
});

it('should interpolate a blocks expression', () => {
  const from = {
    blocks: '{{blocks}}',
  };
  const to = computeBlocks(from, {
    blocks: [{ slug: 'RichText', content: 'Yeah man' }],
  });
  expect(to).toEqual({
    blocks: [{ slug: 'RichText', content: 'Yeah man' }],
  });
});

it('should keep css', () => {
  const from = {
    blocks: [
      {
        slug: 'Action',
        text: 'Ajouter un employeur',
        type: 'event',
        value: 'Admin update page',
        payload: {
          displayForm: true,
          values: {
            _id: null,
            name: '',
            emails: [],
            advantages: '',
          },
        },
        cssId: 8708712,
      },
      {
        slug: 'Action',
        text: '{{company.name}}',
        className: 'company-{{company._id}}',
        type: 'event',
        css: ':block {\n  display: flex;\n}\n.pr-block-action__button {\n  padding: .2rem 1.2rem;\n}\n:block.company-{{values._id}} {\n  background: var(--color-accent);\n  color: var(--color-accent-contrast);\n}',
        'template.repeat': {
          on: '{{companies}}',
          as: 'company',
        },
        value: 'Admin update page',
        payload: {
          displayForm: true,
          values: '{{company}}',
        },
        cssId: 3694322,
      },
    ],
    css: ':block {\n  display: flex;\n  width: 33%;\n  flex-direction: column;\n}',
    sectionId: 'debug',
    cssId: 8316733,
    parentClassName: 'pr-block-blocks-list__block--0',
    className: 'pr-block-blocks-list__block pr-block-blocks-list__block--0 ',
  };
  const to = computeBlocks(from, {
    automation: 'Admin init page',
    updateOn: 'Admin update page',
    favicon:
      'https://prismeai-uploads-prod.oss.eu-west-0.prod-cloud-ocb.orange-business.com/6JkZsgq/meAWhljvJvaK5HK24wGA_.favicon.png',
    companies: [
      {
        _id: '64146c0c66e6397bdb2e5d29',
        name: 'SNCF',
        advantages:
          '<h1>Avantages réservés aux salariés SNCF :</h1><p><br></p><p> Bénéficiez du <span style="color: rgb(0, 102, 204);">Prêt SOFIAP Avantage +</span>*, e<span style="background-color: var(--color-background);">n complément du prêt principal souscrit à la SOFIAP,</span></p><p>Un prêt immobilier à taux bonifié pouvant aller&nbsp;jusqu’à 40&nbsp;000€,&nbsp;sans conditions de ressources, pour l’acquisition de votre résidence principale partout en France*</p><p><strong style="color: rgb(0, 102, 204);"><u>Votre taux d\'intérêt à -50%* :</u></strong></p><ul><li>Jusqu’à 40 000€&nbsp;pour l’acquisition d’un bien situé en Ile de France</li><li>Jusqu’à 20 000€&nbsp;en province, sans condition de zone géographique</li><li>+ une&nbsp;majoration jusqu’à 5 000€&nbsp;pour un couple de salariés SNCF</li><li>Durée maximale de 10 ans</li><li>Sans condition de ressources, quelle que soit la composition de votre foyer, partout en France.</li><li>Sans nécessité de changer de domiciliation bancaire</li></ul><p><a href="https://www.sofiap.fr/offre/offre-sofiap-sncf-2023" rel="noopener noreferrer" target="_blank">*Plus d\'infos en cliquant ici</a></p>',
        emails: ['sncf.fr', 'sncf.com'],
      },
      {
        _id: '643ebb9384473881cb047504',
        name: 'EDF',
        advantages:
          '<h1 class="ql-align-center"><strong>Offre prêt bonifié pour les salariés IEG : accéder à la propriété aux meilleures conditions.</strong></h1><p><span style="color: rgb(38, 37, 52); background-color: rgb(243, 243, 243);">EDF SA et&nbsp;EDF PEI, en partenariat avec&nbsp;SOFIAP, vous permettent de financer à taux exceptionnel, l’acquisition ou les travaux de votre résidence principale*</span></p><p><span style="color: rgb(39, 93, 216); background-color: rgb(243, 243, 243);">Votre employeur prend en charge tout ou&nbsp;partie </span><span style="color: rgb(39, 93, 216);">des intérêts de votre projet !&nbsp;</span></p><p><strong>Pour cela, vous devez obtenir votre fiche d\'Autorisation d\'Accès au Dispositif d\'Accession à la Propriété (AADAP). </strong></p><p>Pour les salariés EDF SA&nbsp;demandez à&nbsp;<a href="mailto:Dig-fiche-aadap@edf.fr" rel="noopener noreferrer" target="_blank" style="color: rgb(131, 5, 77);">DIG-FICHE-AADAP@EDF.fr</a>&nbsp;&nbsp;&nbsp;</p><p>Pour les Cadres Supérieurs et les Dirigeants EDF :&nbsp;Se renseigner auprès de vos Ressources Humaines au Département Personnel de Direction&nbsp;</p><p>Pour toutes les autres entités, Les salariés doivent se rapprocher de leur service&nbsp;&nbsp;RH ou Gestionnaire local.</p>',
        emails: ['edf.fr'],
      },
    ],
    cssId: 8598083,
    displayForm: true,
    values: {
      _id: null,
      name: '',
      emails: [],
      advantages: '',
    },
    css: ':block {\n  display: flex;\n  flex-direction: row;\n  flex: 1;\n}',
    parentClassName: 'pr-block-blocks-list__block--1',
    className:
      'pr-block-blocks-list__block pr-block-blocks-list__block--1  block-BlocksList',
  });
  console.log(to.blocks[1]);
  expect(to.blocks[1].css).not.toBeNull();
});
