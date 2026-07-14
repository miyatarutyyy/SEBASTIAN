{
  description = "Sebastian development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { nixpkgs, ... }:
    let
      system = "x86_64-linux";
      pkgs = import nixpkgs {
        inherit system;
      };
    in
    {
      devShells.${system}.default = pkgs.mkShell {
        packages = with pkgs; [
          nodejs_24
          pnpm
        ];

        shellHook = ''
          echo "Sebastian development environment"
          echo "Node.js: $(node --version)"
          echo "pnpm:    $(pnpm --version)"
        '';
      };
    };
}
