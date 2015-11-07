# Path to your oh-my-fish.
set fish_path $HOME/.oh-my-fish

# Set Login Message
set --erase fish_greeting

# Theme
# set fish_theme robbyrussell
set fish_theme krisleech

# Which plugins would you like to load? (plugins can be found in ~/.oh-my-fish/plugins/*)
# Custom plugins may be added to ~/.oh-my-fish/custom/plugins/
# Example format: set fish_plugins autojump bundler

# Path to your custom folder (default path is $FISH/custom)
#set fish_custom $HOME/dotfiles/oh-my-fish

# Load oh-my-fish configuration.
. $fish_path/oh-my-fish.fish

# ls change to gls
alias ls='gls --color=auto'

# coconala周りのシェルスクリプト
alias cvup="~/shellScript/coconala/cVagrantUp.sh"
alias cvhalt="~/shellScript/coconala/cVagrantHalt.sh"
alias cvssh="~/shellScript/coconala/cVagrantSSH.sh"
alias cgwatch="~/shellScript/coconala/cGruntWatch.sh"

# homebrew
set -x PATH /usr/local/bin /usr/local/sbin $PATH

# rbenv
#eval "$(rbenv init -)";
set -x PATH $HOME/.rbenv/bin $PATH
set -x PATH $HOME/.rbenv/shims $PATH
rbenv rehash >/dev/null ^&1

# npm
#export PATH="/usr/local/share/npm/bin:$PATH"
set -x PATH /usr/local/share/npm/bin $PATH

# peco
function fish_user_key_bindings
  bind \cr peco_select_history # Bind for prco history to Ctrl+r
end

set fish_plugins peco
set -x HOMEBREW_CASK_OPTS "--appdir=/Applications"

set PYENV_ROOT $HOME/.pyenv
set -x PATH $PYENV_ROOT/shims $PYENV_ROOT/bin $PATH
pyenv rehash
