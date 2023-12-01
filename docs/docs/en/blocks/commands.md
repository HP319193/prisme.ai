# Update commands

A Block can update its config in real time by listening to an event and merge
its payload with its current configuration.

The payload can contain commands to modify the final configuration with greater
finesse.

## $merge

You can merge an actual value instead of replace it by using this command
following this example:

```yaml
payload:
  $merge:
    foo:
      - item 2
```

will add "item 2" to the `foo` array.
