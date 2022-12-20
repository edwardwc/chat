<script>
    import { createPicker } from 'picmo';
    import { createEventDispatcher, onMount } from "svelte";

    onMount(() => {
        const dispatch = createEventDispatcher();

        const rootElement = document.querySelector('#emojiPicker');

        const picker = createPicker({ rootElement });
        picker.addEventListener('emoji:select', event => {
            console.log('Emoji selected:', event.emoji);
        });

        picker.addEventListener('click', () => console.log("clicked!"))
    })
</script>

<button id="emojiPicker">
    Pick Emoji
</button>