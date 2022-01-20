import { interpolate } from "./interpolate";

it("should not crash when obtaining stream with null parts", async () => {
  const replacedStream = interpolate(
    [
      { type: "text", value: "Nothing to replace." },
      { type: "text", value: null },
      null,
    ],
    {}
  );

  expect(replacedStream).toEqual([
    { type: "text", value: "Nothing to replace." },
    { type: "text", value: null },
    null,
  ]);
});

it("should replace successfully in a simple string", async () => {
  const replacedStream = interpolate("{{param}}", { param: "Hello" });

  expect(replacedStream).toEqual("Hello");
});

it("should replace successfully a singled-out param by its value", async () => {
  const replacedStream = interpolate("{{param}}", {
    param: ["Hello", "beautiful", "array"],
  });

  expect(replacedStream).toEqual(["Hello", "beautiful", "array"]);
});

it("should not replace anything and return exact same stream", async () => {
  const replacedStream = interpolate(
    [{ type: "text", value: "Nothing to replace." }],
    {}
  );

  expect(replacedStream).toEqual([
    { type: "text", value: "Nothing to replace." },
  ]);
});

it("should remove undefined variables", async () => {
  const replacedStream = interpolate(
    [{ type: "text", value: "This will be cleared : {{foo}}" }],
    {
      foo: undefined,
    }
  );

  expect(replacedStream).toEqual([
    { type: "text", value: "This will be cleared : " },
  ]);
});

it("should replace in text", async () => {
  const replacedStream = interpolate(
    [{ type: "text", value: "I love {{fruit}} and {{vegetables}}." }],
    { fruit: "apple", vegetables: "onions" }
  );

  expect(replacedStream).toEqual([
    { type: "text", value: "I love apple and onions." },
  ]);
});

it("should replace in cards titles and description", async () => {
  const replacedStream = interpolate(
    [
      {
        type: "card",
        value: "I love {{fruit}} and {{vegetables}}.",
        title: "{{title}}",
      },
    ],
    { fruit: "apple", vegetables: "onions", title: "My favorite food" }
  );

  expect(replacedStream).toEqual([
    {
      type: "card",
      value: "I love apple and onions.",
      title: "My favorite food",
    },
  ]);
});

it("should replace in cards buttons", async () => {
  const replacedStream = interpolate(
    [
      {
        type: "card",
        value: "Description",
        title: "Title",
        buttons: [
          { type: "event", text: "Mon évènement", value: "TRIGGER_{{event}}" },
          { type: "link", text: "Mon site web", value: "{{url}}" },
          {
            type: "link",
            text: "Mon site web",
            value: "https://mon.site.web/search?q={{parameter}}",
          },
        ],
      },
    ],
    {
      event: "WOW",
      url: "https://amazing.work.com/",
      parameter: "a subtle search",
    }
  );

  expect(replacedStream).toEqual([
    {
      type: "card",
      value: "Description",
      title: "Title",
      buttons: [
        { type: "event", text: "Mon évènement", value: "TRIGGER_WOW" },
        {
          type: "link",
          text: "Mon site web",
          value: "https://amazing.work.com/",
        },
        {
          type: "link",
          text: "Mon site web",
          value: "https://mon.site.web/search?q=a subtle search",
        },
      ],
    },
  ]);
});

it("should replace in a string array", async () => {
  const params = {
    secondValue: "deuxieme choix",
  };
  const input = [
    {
      questions: [
        {
          "say question": {
            output: "mySelect",
            labels: "Quelle valeur choisir ?",
            validator: {
              values: {
                value: ["premier choix", "{{secondValue}}", "troisième choix"],
              },
            },
          },
        },
      ],
      buttons: [{ "say button": { text: "Valider", value: "confirm" } }],
      type: "form",
    },
  ];
  const replacedStream = interpolate(input, params);
  expect(replacedStream).toEqual([
    {
      questions: [
        {
          "say question": {
            output: "mySelect",
            labels: "Quelle valeur choisir ?",
            validator: {
              values: {
                value: ["premier choix", "deuxieme choix", "troisième choix"],
              },
            },
          },
        },
      ],
      buttons: [{ "say button": { text: "Valider", value: "confirm" } }],
      type: "form",
    },
  ]);
});

it("should replace and display a stringify object for objet parameters", async () => {
  const user = { email: "john.doe@mail.com", name: "John Doe" };
  const replacedStream = interpolate(
    [
      {
        type: "text",
        value: "This is everything we know about you : {{user}}.",
      },
    ],
    { user }
  );

  expect(replacedStream).toEqual([
    {
      type: "text",
      value: `This is everything we know about you : ${JSON.stringify(
        user,
        null,
        "  "
      )}.`,
    },
  ]);
});

it("should not replace a parameter which starts with the name of another parameter", async () => {
  const user = { email: "john.doe@mail.com", name: "John Doe" };
  const replacedStream = interpolate(
    [
      {
        type: "text",
        value: "This is everything we know about you : {{userOtherVariable}}.",
      },
    ],
    { user, userOtherVariable: "Nothing" }
  );

  expect(replacedStream).toEqual([
    {
      type: "text",
      value: `This is everything we know about you : Nothing.`,
    },
  ]);
});

it("should replace nested parameters", async () => {
  const replacedStream = interpolate(
    [
      {
        type: "text",
        value: "You are {{user.name}} and this is your email : {{user.email}}.",
      },
    ],
    { user: { email: "john.doe@mail.com", name: "John Doe" } }
  );

  expect(replacedStream).toEqual([
    {
      type: "text",
      value: "You are John Doe and this is your email : john.doe@mail.com.",
    },
  ]);
});

it("should replace nested parameters with underscore in it", async () => {
  const replacedStream = interpolate(
    [
      {
        type: "text",
        value:
          "You are {{us_er.name}} and this is your email : {{us_er.em_ail}}.",
      },
    ],
    { us_er: { em_ail: "john.doe@mail.com", name: "John Doe" } }
  );

  expect(replacedStream).toEqual([
    {
      type: "text",
      value: "You are John Doe and this is your email : john.doe@mail.com.",
    },
  ]);
});

it("should replace nested arrays parameters", async () => {
  const replacedStream = interpolate(
    [
      {
        type: "function",
        resource: "myFunction",
        parameters: {
          myData: "{{myData}}",
        },
      },
    ],
    {
      myData: [
        [1, 2, 3],
        [1, { deux: 2 }, 3],
        [1, 2, [3]],
        [1, { deux: [2] }, 3],
      ],
    }
  );

  expect(replacedStream).toEqual([
    {
      type: "function",
      resource: "myFunction",
      parameters: {
        myData: [
          [1, 2, 3],
          [1, { deux: 2 }, 3],
          [1, 2, [3]],
          [1, { deux: [2] }, 3],
        ],
      },
    },
  ]);
});

it("should replace by nothing when going too deep", async () => {
  const replacedStream = interpolate(
    [
      {
        type: "richText",
        value:
          "You are {{user.name.first}} and this is your email : {{user.email}}.",
      },
    ],
    { user: { email: "john.doe@mail.com", name: "John Doe" } }
  );

  expect(replacedStream).toEqual([
    {
      type: "richText",
      value: "You are  and this is your email : john.doe@mail.com.",
    },
  ]);
});

it("should replace by an empty string a parameter which is not in the context", async () => {
  const replacedStream = interpolate(
    [
      {
        type: "richText",
        value: "I love {{fruit}} and {{vegetables}}.",
      },
    ],
    { fruit: "apple" }
  );

  expect(replacedStream).toEqual([
    {
      type: "richText",
      value: "I love apple and .",
    },
  ]);
});

it("array of numbers should be kept intact", async () => {
  const replacedStream = interpolate(
    [
      {
        "say text": "{{lieux}}",
      },
    ],
    {
      lieux: [
        {
          _id: "612d0097ac1e3fbc4a04d485",
          name: "Ecole du Champ de Foire (sous videoprotection)",
          address: "Rue du Champ de Foire",
          type: "Bâtiments scolaires",
          location: {
            type: "Point",
            coordinates: [47.0826436, 2.3865358],
          },
          updatedAt: "2021-08-30T16:00:23.069Z",
        },
      ],
      type: "Bâtiments scolaires",
    }
  );

  expect(replacedStream).toEqual([
    {
      "say text": [
        {
          _id: "612d0097ac1e3fbc4a04d485",
          name: "Ecole du Champ de Foire (sous videoprotection)",
          address: "Rue du Champ de Foire",
          type: "Bâtiments scolaires",
          location: {
            type: "Point",
            coordinates: [47.0826436, 2.3865358],
          },
          updatedAt: "2021-08-30T16:00:23.069Z",
        },
      ],
    },
  ]);
});
