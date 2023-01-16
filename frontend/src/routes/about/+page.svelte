<script>
    import EmojiPicker from "$lib/test.svelte";

    let pickedEmoji = "";

    function onEmojiChange(event) {
        pickedEmoji = event.detail.emoji;
    }
</script>


<main>
    <h1>Hello CodeSandbox</h1>
    <h2>Start editing to see some magic happen!</h2>
    <EmojiPicker on:change={onEmojiChange}/>
    <h2>Picked emoji</h2>
    {pickedEmoji}
</main>