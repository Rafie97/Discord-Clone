function embedDiscord() {

    const url = 'https://www.tsogiants.org/api/public-chat-init';

    fetch(url).then(resp => resp.json()).then(data => {
        //console.log(JSON.stringify(data));
        public_channels = JSON.stringify(data);
        var discord = new DiscordEmbed(public_channels);
        //discord_embed.innerHTML = "";
        discord.init();

    }).catch((e) => console.log(e));

}

class DiscordEmbed {
    constructor(public_channels) {

        this.categories = JSON.parse(public_channels).categories;
        this.channels = JSON.parse(public_channels).channels;

        //this.categories = public_channels.categories;
        //this.channels = public_channels.channels;

        this.discord_channel_wrapper = document.getElementById("discord-channel-wrapper");
        this.channel_header = document.getElementById("channel-header");

        this.discord_channels = document.getElementById("discord-channels");
        console.log(Object.getOwnPropertyNames(this.discord_channels));
        //this.rearrangeChannels();
        this.discord_user = document.getElementById("discord-user");

        this.discord_chat_wrapper = document.getElementById("discord-chat-wrapper");
        this.chat_header = document.getElementById("chat-header");
        this.discord_chat = document.getElementById("discord-chat");
    
        this.discord_input = document.getElementById("discord-input");
        this.discord_input_field = document.getElementById("dis-input-field");
        //this.discord_input_field.innerHTML = ("Message #" + active_channel_name);
              
        this.active_channel = document.createElement("div");
        this.active_channel.id = "active-channel";
        this.active_channel.className = "active-channel"
        //this.active_channel.innerHTML = active_channel_name;
        this.chat_header.appendChild(this.active_channel);

        var hash = document.getElementById("hash");
 
        //this.active_channel = document.getElementById("active-channel");

        //var active_channel_name = this.discord_channels.getElementsByClassName('channel active')[0].getElementsByClassName("label")[0].innerHTML;

        this.channel_log = document.getElementById("discord-channel-log");

        this.createMessage = this.createMessage.bind(this);

        //Populate Categories and Channels

        for (var i = 0; i < Object.keys(this.categories).length; i++) {
            this.categories[Object.keys(this.categories)[i]].element = this.createCategory(this.categories[Object.keys(this.categories)[i]].name);
        }

        for (i = 0; i < Object.keys(this.channels).length; i++) {
            //console.log(Object.keys(this.channels)[i]);
            this.channels[Object.keys(this.channels)[i]].element = this.createChannel(this.channels[Object.keys(this.channels)[i]].name, Object.keys(this.channels)[i]);
        }

    }

    init() {
        //element.appendChild(this.discord_channel_wrapper);
        //element.appendChild(this.discord_chat_wrapper);

        this.channel_log.insertBefore(this.createMessage("Message with avatar.", "Dr. Foland", "https://cdn.discordapp.com/avatars/443459519859916830/6c090bce87b60e0899f31717059b43a9.png?size=128", "Today at 3:25 PM"), this.channel_log.lastChild);
        this.channel_log.insertBefore(this.createMessage("Follow-up message.", "Dr. Foland", "", "3:26 PM"), this.channel_log.lastChild);
        this.channel_log.insertBefore(this.createMessage("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", "Dr. Foland", "", "3:28 PM"), this.channel_log.lastChild);
        this.channel_log.insertBefore(this.createMessage("Generic web users should be able to pick a favorite color. My favorite color is blue.", "Lauren", "https://www.tsogiants.org/images/avatars/user-blue.png", "3:40 PM"), this.channel_log.lastChild);
        this.discord_chat.scrollTop = this.discord_chat.scrollHeight;

        //create message 

    }


    rearrangeChannels() {
        var categories = Object.entries(this.categories);
        categories.sort((a, b) => (a[1].position > b[1].position) ? 1 : -1);


        var channels = [];
        for (var i = 0; i < categories.length; i++) {
            channels.push([]);
            for (var j = 0; j < Object.keys(this.channels).length; j++) {
                if (this.channels[Object.keys(this.channels)[j]].category == categories[i][0]) {
                    channels[i].push(this.channels[Object.keys(this.channels)[j]]);
                    channels[i][channels[i].length - 1].id = Object.keys(this.channels)[j];
                }
            }
            channels[i].sort((a, b) => (a.position > b.position) ? 1 : -1);
        }
        this.discord_channels.innerHTML = "";
        for (i = 0; i < categories.length; i++) {
            this.discord_channels.appendChild(categories[i][1].element);
            for (j = 0; j < channels[i].length; j++) {
                if (!i && !j) {
                    channels[i][j].element.classList.add("active");
                }
                this.discord_channels.appendChild(channels[i][j].element);
            }
        }
        //console.log(channels);
    }

    createCategory(title) {
        var catElem = document.createElement("div");
        catElem.className = 'category';
        catElem.innerHTML = title;
        return catElem;
    }

    createChannel(title, id, active = false) {

        var channel = document.createElement("div");
        channel.className = "channel"
        channel.id = id;

        if (active) channel.classList.add("active");
        //channel.appendChild(hash);
        var labl = document.createElement('div');
        labl.className = "label";
        labl.innerHTML = title;

        channel.appendChild(labl);

        channel.addEventListener("click", () => {
            if (!channel.classList.contains("active")) {
                var channels = channel.parentElement.getElementsByClassName("channel")
                Array.prototype.forEach.call(channels, function (item) {
                    item.classList.remove("active");
                });
                channel.classList.add('active');
                document.getElementById("active-channel").innerHTML = channel.children[1].innerHTML;
                //channel.parentElement.parentElement.style.marginLeft = "-240px";
                var msgInput = document.getElementsByName('discord_input')[0];
                msgInput.placeholder = "Messages #" + channel.children[1].innerHTML;

                this.channel_log.innerHTML = "";
                var channelMessages = this.channels[id].messages;
                console.log("Channel Messages", channelMessages);

                Object.keys(channelMessages).forEach(msgkey => {
                    var msgInfo = channelMessages[msgKey];
                    console.log("Message Info: " + msgInfo)
                    this.channel_log.insertBefore(this.createMessage(channelMessages[msgkey].content, channelMessages[msgkey].author.name, channelMessages[msgkey].author.avatar, channelMessages[msgkey].time), this.channel_log.lastChild)
                })



                /*	
				this.channel_log.innerHTML = "";
                this.channel_log.appendChild(this.scroll_spacer);

                var channelMessages = this.channels[id].messages;

                let msgArr = [];

                Object.keys(channelMessages).forEach(msgkey => {
                    var msgInfo = channelMessages[msgkey];
                    msgArr.push(msgInfo);
                })

                const sortedMessages = msgArr.sort((a, b) => a.time - b.time).reverse();
                console.log(sortedMessages);

                sortedMessages.forEach((m) => {
                    this.channel_log.insertBefore(this.createMessage(m.content, m.author.name, m.author.avatar, m.time), this.channel_log.lastChild)
                })
*/
            }
        });
        return channel;
    }


    createMessage(text, author = "", avatar = "", time = "") {

        //var message = document.createDiv("", "message"); //

        console.log("createMessageHappened")

        var message = document.createElement("div");
        message.className = "message";

        let avatar_container;

        var header = false;

        if (avatar) {
            //var avatar_container = document.createDiv("", "avatar"); //
            avatar_container = document.createElement("div");
            avatar_container.className = "avatar";

            var image = document.createElement("IMG");
            image.src = avatar;
            avatar_container.appendChild(image);
            //header = document.createDiv(); //
            header = document.createElement("div");

            var userSpan = document.createElement("span");
            userSpan.className = "username";
            userSpan.innerHTML = author;

            var timeSpan = document.createElement("span");
            timeSpan.className = "timestamp";
            timeSpan.innerHTML = time;

            header.appendChild(userSpan); //
            header.appendChild(timeSpan); //

        } else {
            //var avatar_container = document.createDiv("", "avatar-spacer", "", time); //
            avatar_container = document.createElement("div");
            avatar_container.className = "avatar-spacer";
            avatar_container.innerHTML = time;
        }

        //var content = document.createDiv("", "content"); //
        var content = document.createElement("div");
        content.className = "content";

        message.appendChild(avatar_container);
        message.appendChild(content);

        if (header) {
            content.appendChild(header);
            message.classList.add("top");
        }

        var inText = document.createElement("div");
        inText.className = "text";
        inText.innerHTML = text;
        content.appendChild(inText);

        this.discord_chat.appendChild(message);
        return message;
    }
}
