clean:
	rm -rf test/testAssets/C/.vscode
	rm -f test/testAssets/C/.clang-format
	rm -f test/testAssets/C/.editorconfig
	rm -f test/testAssets/C/.gitattributes
	rm -f test/testAssets/C/.gitignore
	rm -rf test/testAssets/Cpp/.vscode
	rm -f test/testAssets/Cpp/.clang-format
	rm -f test/testAssets/Cpp/.editorconfig
	rm -f test/testAssets/Cpp/.gitattributes
	rm -f test/testAssets/Cpp/.gitignore
	rm -rf test/testAssets/CMinimal/.vscode
	rm -f test/testAssets/CMinimal/.clang-format
	rm -f test/testAssets/CMinimal/.editorconfig
	rm -f test/testAssets/CMinimal/.gitattributes
	rm -f test/testAssets/CMinimal/.gitignore
	rm -rf test/testAssets/CppMinimal/.vscode
	rm -f test/testAssets/CppMinimal/.clang-format
	rm -f test/testAssets/CppMinimal/.editorconfig
	rm -f test/testAssets/CppMinimal/.gitattributes
	rm -f test/testAssets/CppMinimal/.gitignore

.phony: clean
